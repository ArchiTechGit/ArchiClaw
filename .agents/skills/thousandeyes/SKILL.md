---
name: thousandeyes
description: Cisco ThousandEyes skill using the official hosted MCP server via mcp-remote. Use for test inventory, path analysis, events, alerts, outage triage, endpoint metrics, and network performance investigations.
version: 1.0.0
tags: [cisco, thousandeyes, mcp, network-monitoring, path-visualization, alerts, outages]
---

# Cisco ThousandEyes

## Purpose

Use this skill when users need operational visibility from ThousandEyes, including test status, event timelines, alert context, outage correlation, endpoint health, and path/BGP analysis.

## Official MCP Server

- Repository: CiscoDevNet/ThousandEyes-MCP-Server-official
- Repository URL: [CiscoDevNet/ThousandEyes-MCP-Server-official](https://github.com/CiscoDevNet/ThousandEyes-MCP-Server-official)
- Hosted MCP endpoint: [https://api.thousandeyes.com/mcp](https://api.thousandeyes.com/mcp)
- Transport: Streamable HTTP via `mcp-remote`
- Authentication: Bearer token in the Authorization header

## mcp-remote Invocation

Use the `mcp-remote` executable to bridge the remote MCP endpoint.

Example command:

```bash
mcp-remote https://api.thousandeyes.com/mcp \
  --transport http-only \
  --header "Authorization: Bearer ${TE_TOKEN}"
```

If `mcp-remote` is not installed globally, use:

```bash
npx -y mcp-remote https://api.thousandeyes.com/mcp \
  --transport http-only \
  --header "Authorization: Bearer ${TE_TOKEN}"
```

## Environment Variables

### Required

- `TE_TOKEN`: ThousandEyes API bearer token used for MCP authentication.

### Optional

- `THOUSANDEYES_MCP_URL`: Override endpoint URL. Default is `https://api.thousandeyes.com/mcp`.
- `MCP_REMOTE_BIN`: Absolute path or command name for the executable. Default is `mcp-remote`.
- `TE_ACCOUNT_GROUP_ID`: Account group scope (`aid`) for multi-group org workflows.
- `HTTPS_PROXY`: Proxy URL for outbound HTTPS requests when required by network policy.
- `HTTP_PROXY`: Proxy URL for environments where HTTP proxy routing is used.
- `NO_PROXY`: Comma-separated hosts that should bypass proxy.

## Setup Pattern

```bash
export TE_TOKEN="<your_thousandeyes_token>"
export THOUSANDEYES_MCP_URL="https://api.thousandeyes.com/mcp"  # optional
export MCP_REMOTE_BIN="mcp-remote"                                # optional

"${MCP_REMOTE_BIN}" "${THOUSANDEYES_MCP_URL:-https://api.thousandeyes.com/mcp}" \
  --header "Authorization: Bearer ${TE_TOKEN}"
```

## Operator Guidelines

- Use only ThousandEyes API v7 semantics and endpoints; do not use v6 or earlier API versions.
- Always use MCP tools exclusively; never fall back to `curl`, `fetch`, `wget`, or direct HTTP client calls to the ThousandEyes API.
- If MCP tools are unavailable or return an error, stop and report the failure — do not attempt to replicate the call through any other mechanism.
- Prefer read-oriented calls first: list tests, list alerts, list events, get details.
- Use bounded time windows for incident analysis to reduce noise.
- For performance triage, correlate path visualization with alerts/events before conclusions.
- Avoid rapid-fire repeated queries to reduce API pressure and rate-limit risk.
- For cross-account investigations, set `TE_ACCOUNT_GROUP_ID` and state the active scope in findings.

## Typical Workflows

### Network health snapshot

1. List active tests and key recent results.
2. List active/triggered alerts.
3. List events in a constrained window.
4. Summarize impacted targets and likely domains (ISP, DNS, SaaS, internal edge).

### Path troubleshooting

1. Find the relevant test for source/target.
2. Pull path visualization and identify high-latency/high-loss hops.
3. Correlate with alert and event timing.
4. Provide likely fault domain and next validation step.

### Outage investigation

1. Enumerate active alerts and related events.
2. Retrieve detailed context for affected tests/targets.
3. Check broader outage indicators.
4. Produce timeline, blast radius, and recovery signal summary.

## Response Style

- Report facts first (what changed, when, where).
- Call out uncertainty and missing telemetry explicitly.
- Include account scope, time window, and tested hypotheses.
- End with concrete next actions.
