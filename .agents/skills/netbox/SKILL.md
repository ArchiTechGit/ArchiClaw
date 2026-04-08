---
name: netbox
description: NetBox skill for interacting with a NetBox MCP service for DCIM and IPAM inventory, device lookup, interface state, prefixes, IP addresses, VLANs, racks, and tenancy data. Use when users need network source-of-truth data from NetBox through MCP tools.
version: 1.0.0
tags: [netbox, mcp, dcim, ipam, network-automation, inventory, addressing]
---

# NetBox

## Purpose

Use this skill when users need source-of-truth data from NetBox, including device inventory, sites, racks, interfaces, cables, IP addresses, prefixes, VLANs, circuits, contacts, and tenancy relationships.

## NetBox MCP Service Model

- NetBox itself is the source-of-truth platform and exposes a REST API.
- This skill targets a local, read-only MCP server running HTTP transport at `host.docker.internal:8000/mcp`.
- The server exposes read-oriented tools such as `get_objects`, `get_object_by_id`, and `get_changelogs`.
- No authentication is required to connect to the MCP endpoint.

## Typical Configuration

No configuration is required to connect. The MCP server is available at `http://host.docker.internal:8000/mcp` by default.

## MCP Endpoint

The NetBox MCP server is available at:

```text
http://host.docker.internal:8000/mcp
```

No authentication token or headers are needed. Connect your MCP client directly to this endpoint.

### Verify the server is reachable

```bash
curl -s http://host.docker.internal:8000/mcp
```

## Connecting with mcp-remote

Use `mcp-remote` to bridge the HTTP MCP endpoint for clients that require a local stdio MCP process.

```bash
mcp-remote http://host.docker.internal:8000/mcp --transport http-only
```

If `mcp-remote` is not installed globally:

```bash
npx -y mcp-remote http://host.docker.internal:8000/mcp --transport http-only
```

No authentication headers are needed. The `--transport http-only` flag prevents `mcp-remote` from attempting an SSE upgrade.

## Operator Guidelines

- Use MCP tools exclusively; do not fall back to `curl`, `fetch`, `wget`, or direct REST calls against NetBox.
- If the MCP service is unavailable or returns an error, stop and report the failure instead of attempting a side-channel API call.
- Prefer read operations first: search, list, and detail retrieval before proposing or applying writes.
- Treat this server as read-only access to the NetBox source of truth.
- Use field filtering when available to reduce token usage on large object collections.
- Scope lookups narrowly by site, tenant, role, device name, prefix, VRF, or tag to avoid noisy results.
- Be explicit about whether you are reading DCIM objects, IPAM objects, virtualization objects, or tenancy data.
- Do not assume plugin-defined NetBox object types are available; this server is limited to supported core NetBox objects.
- Use changelog queries when the user asks who changed an object or when a change happened.

## Typical Workflows

### Inventory lookup

1. Search for the site, rack, or device.
2. Retrieve device details, role, platform, tenant, and status.
3. Inspect interfaces, front and rear ports, cables, or connected peers.
4. Summarize the current state and any missing data.

### IPAM investigation

1. Search for the prefix, IP address, VLAN, or VRF.
2. Retrieve parent and child prefixes, allocations, and assignments.
3. Check related interfaces, devices, and tenants.
4. Summarize ownership, utilization, and likely next action.

### Audit trail lookup

1. Read the current object state first.
2. Retrieve changelog records for the relevant object, site, or device.
3. Correlate object history with current state.
4. Summarize who changed what, when it changed, and what follow-up to validate.

### Data quality triage

1. Find objects with missing owners, inconsistent status, or incomplete addressing.
2. Correlate related objects across DCIM and IPAM.
3. Highlight what is authoritative versus what appears inconsistent.
4. Recommend the minimum corrective update.

## Response Style

- Report facts first, including object names, IDs, and scopes.
- State whether the result comes from DCIM, IPAM, virtualization, circuits, or tenancy data.
- Call out ambiguity, missing relationships, and stale-looking records explicitly.
- When using changelog data, include the time window and affected objects.
- End with concrete next actions or validation steps.
