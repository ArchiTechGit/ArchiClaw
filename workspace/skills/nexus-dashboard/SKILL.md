---
name: nexus-dashboard
description: Nexus Dashboard MCP skill using the "nexus-dashboard" MCP server for Cisco Nexus Dashboard queries and operational workflows.
version: 1.0.0
tags: [cisco, nexus-dashboard, mcp, datacenter, operations, networking]
---

# Nexus Dashboard MCP Server

## Purpose

Use this skill when users need Cisco Nexus Dashboard operations through MCP tools for cluster onboarding validation, read-only fabric assessment, controlled edit-mode changes, and audit/compliance review.

## MCP Server

This skill uses the `nexus-dashboard` MCP server from the ArchiTechGit project. This is expected to run as a local service reachable through the NemoClaw network bridge.

- Repository: ArchiTechGit/nexus-dashboard-mcp
- Repository URL: [ArchiTechGit/nexus-dashboard-mcp](https://github.com/ArchiTechGit/nexus-dashboard-mcp)
- Server name: `nexus-dashboard`
- Transport support: Streamable HTTP
- Default HTTP endpoint: `http://nd_mcp_web_api:7100/mcp/sse`
- Authentication: Use `--token $ND_TOKEN` with the local MCP client

## OpenClaw Access Pattern

Use the local MCP client script in this workspace to call the Nexus Dashboard MCP server:

```bash
workspace/scripts/mcp-client.js --url http://nd_mcp_web_api:7100/mcp/sse --token $ND_TOKEN --method XXXX
```

Replace `XXXX` with the MCP method you need, such as `tools/list`.

Set `ND_TOKEN` in the workspace `.env` file.

## Operator Guidelines

- Hard rule: use Nexus Dashboard MCP tools only.
- Never use `web_fetch`, `fetch`, `curl`, `wget`, raw HTTP clients, or any non-MCP mechanism to access Nexus Dashboard data.
- Start with discovery calls (`tools/list` and high-level list/get methods) before deep detail queries.
- Constrain investigations by object scope (fabric, site, policy domain, or tenant) to reduce noise.
- Treat write-capable operations as sensitive and confirm intent before proceeding.
- If MCP tools are unavailable or return errors, stop and report the failure instead of attempting fallback methods.

## Typical Workflows

### Cluster Onboarding and Connectivity Validation

1. Confirm the target cluster profile is configured and reachable.
2. Run initial read-only queries (`tools/list`, fabric and inventory list operations) to validate MCP-to-cluster access.
3. Summarize cluster scope, available operation families, and any connectivity or auth blockers.

### Read-Only Fabric and Operations Assessment

1. Start with GET operations for fabrics, switches, interfaces, networks, VRFs, and anomalies.
2. Correlate findings across fabric health, inventory, and compliance/anomaly results.
3. Return an evidence-based assessment of current state before proposing any changes.

### Controlled Change Workflow (Edit Mode)

1. Confirm edit mode and allowed operations policy before any POST/PUT/DELETE call.
2. Execute the minimum required change operation, then run related verification reads.
3. Summarize what changed, expected impact, and validation outcomes.

### Audit and Compliance Review

1. Review recent operation history with focus on method, endpoint, status, and error fields.
2. Filter for 4XX/5XX failures, high-risk operations, or unexpected client sources.
3. Provide a concise timeline and recommended remediation or follow-up checks.

## Response Style

- Lead with concrete facts: object names/IDs, scope, state, and timestamps.
- State active scope explicitly (site/fabric/tenant or equivalent domain).
- Call out uncertainty, missing telemetry, or permission constraints.
- End with concrete follow-up actions.
