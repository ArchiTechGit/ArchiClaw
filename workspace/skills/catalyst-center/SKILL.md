---
name: catalyst-center
description: Cisco Catalyst Center MCP skill using the "catalyst-center" MCP service for enterprise network operations, assurance, and inventory workflows.
version: 1.0.0
tags: [cisco, catalyst-center, mcp, network-operations, assurance, inventory, compliance]
---

# Cisco Catalyst Center MCP Server

## Purpose

Use this skill when users need Cisco Catalyst Center operations through MCP tools for device and site visibility, assurance issue triage, configuration/template workflows, and compliance/inventory reporting.

## MCP Server

This skill uses the `catalyst-center` MCP server from the ArchiTechGit project.

- Repository: archiTechGit/catalyst-center-mcp-v2
- Repository URL: [archiTechGit/catalyst-center-mcp-v2](https://github.com/archiTechGit/catalyst-center-mcp-v2)
- Server name: `catalyst-center`
- Transport support: HTTP/Streamable HTTP
- Default HTTP endpoint: `http://catc_mcp_web_api:7101`
- Authentication: Use `--token $CATC_TOKEN` with the local MCP client

## OpenClaw Access Pattern

Use the local MCP client script in this workspace to call the Catalyst Center MCP service:

```bash
workspace/scripts/mcp-client.js --url http://catc_mcp_web_api:7101 --token $CATC_TOKEN --method XXXX
```

Replace `XXXX` with the MCP method you need, such as `tools/list`.

Set `CATC_TOKEN` in the workspace `.env` file.

## Operator Guidelines

- Hard rule: use Catalyst Center MCP tools only.
- Never use `web_fetch`, `fetch`, `curl`, `wget`, raw HTTP clients, or direct Catalyst Center REST calls outside MCP tools.
- Start with discovery calls (`tools/list`, devices, sites, health) before deeper operational actions.
- Constrain investigations by specific scope (site, device, issue ID, time range) to reduce noise.
- Treat write-capable operations (for example issue resolution or template deployment) as sensitive and confirm intent before proceeding.
- If MCP tools are unavailable or return errors, stop and report the failure instead of attempting fallback methods.

## Typical Workflows

### Device and Site Visibility

1. List network devices and optionally filter by device type or hostname.
2. Retrieve device detail and site/topology context for impacted nodes.
3. Summarize inventory state, topology placement, and operational gaps.

### Assurance Issue Triage

1. Query assurance issues with filters (status, priority, severity, site, device, time window).
2. Correlate issues with device/site health and related events.
3. Recommend next actions, and use issue resolution operations only with explicit approval.

### Configuration and Template Operations

1. List available templates and gather template details.
2. Validate target device scope and operational prerequisites.
3. Execute deployment actions when approved, then verify post-change status.

### Compliance and Lifecycle Reporting

1. Retrieve compliance detail for target devices.
2. Collect inventory, license usage, and software version context.
3. Summarize compliance posture, lifecycle risks, and remediation priorities.

## Response Style

- Lead with concrete facts: site/device identifiers, issue IDs, state, and timestamps.
- State scope explicitly (site, device set, issue filters, and time window).
- Call out uncertainty, missing telemetry, or permission constraints.
- End with concrete follow-up actions.
