#!/usr/bin/env node
// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const DEFAULT_CLIENT_NAME = "nemoclaw-mcp-client";
const DEFAULT_CLIENT_VERSION = "0.1.0";

function printUsage() {
  const usage = [
    "Usage:",
    "  node scripts/mcp-client.js --url <mcp_endpoint> --method <mcp_method> [options]",
    "",
    "Required:",
    "  --url <url>                 MCP Streamable HTTP endpoint (for example: https://example.com/mcp)",
    "  --method <name>             MCP method to call (for example: tools/list)",
    "",
    "Optional:",
    "  --params <json>             JSON params object for method call (default: {})",
    "  --token <token>             Bearer token for Authorization header",
    "  --header <k:v>              Additional HTTP header (repeatable, for example: --header 'X-Trace-Id: abc')",
    "  --protocol-version <ver>    MCP protocol version header (default: 2025-06-18)",
    "  --skip-initialize           Skip initialize + initialized notification",
    "  --session-id <id>           Existing Mcp-Session-Id to reuse",
    "  --help                      Show this help",
    "",
    "Examples:",
    "  node scripts/mcp-client.js --url https://api.thousandeyes.com/mcp --method tools/list --token $TE_TOKEN",
    "  node scripts/mcp-client.js --url https://example.com/mcp --method tools/list --header 'X-Trace-Id: 1234'",
    "  node scripts/mcp-client.js --url https://example.com/mcp --method resources/list --params '{\"cursor\":null}'",
  ].join("\n");
  console.log(usage);
}

function parseArgs(argv) {
  const out = {
    url: "",
    method: "",
    params: "{}",
    token: "",
    headerArgs: [],
    protocolVersion: DEFAULT_PROTOCOL_VERSION,
    skipInitialize: false,
    sessionId: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--skip-initialize") {
      out.skipInitialize = true;
      continue;
    }

    const next = argv[i + 1];
    if (!next) throw new Error(`Missing value for ${arg}`);

    if (arg === "--url") out.url = next;
    else if (arg === "--method") out.method = next;
    else if (arg === "--params") out.params = next;
    else if (arg === "--token") out.token = next;
    else if (arg === "--header") out.headerArgs.push(next);
    else if (arg === "--protocol-version") out.protocolVersion = next;
    else if (arg === "--session-id") out.sessionId = next;
    else throw new Error(`Unknown argument: ${arg}`);

    i += 1;
  }

  return out;
}

function parseAdditionalHeaders(headerArgs) {
  const headers = {};

  for (const headerArg of headerArgs) {
    const sep = headerArg.indexOf(":");
    if (sep <= 0) {
      throw new Error(`Invalid --header value \"${headerArg}\". Expected format: Key: Value`);
    }

    const key = headerArg.slice(0, sep).trim();
    const value = headerArg.slice(sep + 1).trim();

    if (!key || !value) {
      throw new Error(`Invalid --header value \"${headerArg}\". Expected format: Key: Value`);
    }

    headers[key] = value;
  }

  return headers;
}

function buildHeaders({ protocolVersion, token, sessionId, accept, additionalHeaders }) {
  const headers = {
    Accept: accept,
    "Content-Type": "application/json",
    "MCP-Protocol-Version": protocolVersion,
    ...additionalHeaders,
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  return headers;
}

async function sendJsonRpc({ url, message, headers }) {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  const mcpSessionId = response.headers.get("mcp-session-id") || "";
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body}`);
  }

  if (response.status === 202) {
    return { sessionId: mcpSessionId, json: null };
  }

  if (contentType.includes("application/json")) {
    const json = await response.json();
    return { sessionId: mcpSessionId, json };
  }

  if (contentType.includes("text/event-stream")) {
    const json = await readSseUntilResponse(response, message.id);
    return { sessionId: mcpSessionId, json };
  }

  const body = await response.text();
  throw new Error(`Unsupported content-type: ${contentType || "<none>"}. Body: ${body}`);
}

async function readSseUntilResponse(response, requestId) {
  if (!response.body) {
    throw new Error("SSE response did not include a readable body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const sep = buffer.indexOf("\n\n");
      if (sep === -1) break;

      const eventBlock = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      const dataLines = eventBlock
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .filter(Boolean);

      if (dataLines.length === 0) continue;

      const dataPayload = dataLines.join("\n");
      let message;
      try {
        message = JSON.parse(dataPayload);
      } catch {
        continue;
      }

      if (typeof message === "object" && message !== null && "id" in message && message.id === requestId) {
        return message;
      }
    }
  }

  throw new Error(`SSE stream ended before JSON-RPC response id=${requestId} arrived`);
}

async function initializeSession({ url, protocolVersion, token, sessionId, additionalHeaders }) {
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion,
      capabilities: {},
      clientInfo: {
        name: DEFAULT_CLIENT_NAME,
        version: DEFAULT_CLIENT_VERSION,
      },
    },
  };

  const initHeaders = buildHeaders({
    protocolVersion,
    token,
    sessionId,
    accept: "application/json, text/event-stream",
    additionalHeaders,
  });

  const initResponse = await sendJsonRpc({
    url,
    message: initRequest,
    headers: initHeaders,
  });

  const activeSessionId = initResponse.sessionId || sessionId || "";

  const initializedHeaders = buildHeaders({
    protocolVersion,
    token,
    sessionId: activeSessionId,
    accept: "application/json, text/event-stream",
    additionalHeaders,
  });

  const initializedNotification = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {},
  };

  await sendJsonRpc({
    url,
    message: initializedNotification,
    headers: initializedHeaders,
  });

  return activeSessionId;
}

async function callMethod({ url, protocolVersion, token, sessionId, method, params, additionalHeaders }) {
  const request = {
    jsonrpc: "2.0",
    id: 2,
    method,
    params,
  };

  const headers = buildHeaders({
    protocolVersion,
    token,
    sessionId,
    accept: "application/json, text/event-stream",
    additionalHeaders,
  });

  return sendJsonRpc({ url, message: request, headers });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  if (!args.url || !args.method) {
    printUsage();
    process.exitCode = 2;
    return;
  }

  let params;
  try {
    params = JSON.parse(args.params);
  } catch (error) {
    throw new Error(`Invalid --params JSON: ${error.message}`);
  }

  const additionalHeaders = parseAdditionalHeaders(args.headerArgs);

  let activeSessionId = args.sessionId || "";

  if (!args.skipInitialize) {
    activeSessionId = await initializeSession({
      url: args.url,
      protocolVersion: args.protocolVersion,
      token: args.token,
      sessionId: activeSessionId,
      additionalHeaders,
    });
  }

  const result = await callMethod({
    url: args.url,
    protocolVersion: args.protocolVersion,
    token: args.token,
    sessionId: activeSessionId,
    method: args.method,
    params,
    additionalHeaders,
  });

  const output = {
    protocolVersion: args.protocolVersion,
    sessionId: result.sessionId || activeSessionId || null,
    request: {
      method: args.method,
      params,
    },
    response: result.json,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(`mcp-client error: ${error.message}`);
  process.exitCode = 1;
});
