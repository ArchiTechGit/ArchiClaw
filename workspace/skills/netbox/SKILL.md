---
name: netbox
description: NetBox MCP skill for read-only DCIM and IPAM access using the "netbox" MCP server already defined in OpenClaw.
version: 1.0.0
tags: [netbox, mcp, dcim, ipam, network-automation, inventory, changelog]
---

# NetBox MCP Server

## Purpose

Use this skill when users need to query NetBox source-of-truth data through MCP tools, including inventory lookups, IPAM exploration, and change history analysis.

## MCP Server

This skill uses the `netbox` MCP server already defined in OpenClaw.

- GitHub repository: [netboxlabs/netbox-mcp-server](https://github.com/netboxlabs/netbox-mcp-server)
- Server name: `netbox`
- Data access model: read-only

## OpenClaw Access Pattern

Use the local MCP client script in this workspace to call the NetBox MCP server:

```bash
workspace/scripts/mcp-client.js --url http://127.0.0.1:8001 --method XXXX
```

Replace `XXXX` with the MCP method you need, such as `tools/list`.

## Supported Tools

- `get_objects`: Retrieve NetBox core objects by object type and filters.
- `get_object_by_id`: Retrieve detailed data for a specific object by ID.
- `get_changelogs`: Retrieve audit trail and change history entries by filters.

The server supports core NetBox object types. Plugin-defined object types are not guaranteed to be available.

## Object Model Hints

Use these model families as object-type hints when building `get_objects` filters.

| Domain | Typical object types to query first | Common filter hints |
| --- | --- | --- |
| `dcim` | `sites`, `locations`, `racks`, `devices`, `device_types`, `interfaces`, `cables` | `name`, `site`, `location`, `status`, `role`, `device_type`, `tag` |
| `ipam` | `prefixes`, `ip_addresses`, `vlans`, `vrfs`, `asns`, `route_targets` | `prefix`, `address`, `vlan_id`, `vrf`, `status`, `tenant`, `role` |
| `virtualization` | `clusters`, `cluster_groups`, `cluster_types`, `virtual_machines`, `vm_interfaces` | `name`, `cluster`, `site`, `status`, `tenant`, `tag` |
| `circuits` | `providers`, `circuits`, `circuit_terminations`, `provider_networks` | `provider`, `cid`, `status`, `site`, `type`, `tenant` |
| `tenancy` | `tenants`, `tenant_groups`, `contacts`, `contact_groups` | `name`, `slug`, `group`, `tenant`, `tag` |
| `wireless` | `wireless_lans`, `wireless_links` | `ssid`, `site`, `status`, `tenant`, `tag` |
| `vpn` | `tunnels`, `tunnel_groups`, `ike_policies`, `ipsec_policies` | `name`, `group`, `status`, `tenant`, `tag` |

When in doubt, start in `dcim` for physical inventory questions and `ipam` for addressing questions, then pivot to related domains.

## Capability Notes

- Read-only server behavior is expected.
- Field filtering is supported for token-efficient responses when available through tool parameters.
- Changelog access is useful for who-changed-what analysis and timeline reconstruction.

## Usage Guidelines

- Hard rule: use NetBox MCP tools only.
- Never use `web_fetch`, `fetch`, `curl`, `wget`, raw HTTP clients, direct REST calls, or any non-MCP mechanism to access NetBox data.
- Start with narrow filters (site, tenant, role, prefix, VRF, name, status) to reduce noise.
- Prefer list and detail retrieval before conclusions.
- For history questions, include a bounded time window and relevant object scope.
- If a query returns no results, report that clearly and suggest a refined filter.

## Typical Workflows

### Inventory Lookup

1. Use `get_objects` to find target devices, sites, or racks.
2. Use `get_object_by_id` for full object context.
3. Summarize status, ownership, platform, and relationships.

### IPAM Investigation

1. Use `get_objects` to locate prefixes, IP addresses, VLANs, or VRFs.
2. Inspect allocation and assignment relationships.
3. Summarize utilization and likely next actions.

### Audit Trail Analysis

1. Identify object scope first.
2. Use `get_changelogs` for the relevant period.
3. Summarize actor, timestamp, and change type.

## Response Style

- Facts first: object names, IDs, status, and scope.
- State data domain explicitly: DCIM, IPAM, or changelog.
- Call out uncertainty and missing context.
- End with concrete next checks or follow-up queries.
