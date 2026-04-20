---
name: fmc
description: Cisco Secure Firewall Management Center MCP skill using the "fmc" MCP service for firewall policy management, access control, intrusion prevention, and network security operations.
version: 1.0.0
tags: [cisco, fmc, firewall, mcp, security, access-control, intrusion-prevention, policy-management]
---

# Cisco Secure Firewall Management Center MCP Server

## Purpose

Use this skill when users need Cisco Secure Firewall Management Center operations through MCP tools for firewall policy management, access control rule administration, intrusion prevention, network object management, and security event triage.

## MCP Server

This skill uses the `fmc` MCP server from the ArchiTechGit project.

- Server name: `fmc`
- Transport support: HTTP/Streamable HTTP
- Default HTTP endpoint: `http://fmc_mcp_web_api:7102/mcp/sse`
- Authentication: Use `--token $FMC_TOKEN` with the local MCP client

## OpenClaw Access Pattern

Use the local MCP client script in this workspace to call the FMC MCP service:

```bash
workspace/scripts/mcp-client.js --url http://fmc_mcp_web_api:7102/mcp/sse --token $FMC_TOKEN --method XXXX
```

Replace `XXXX` with the MCP method you need, such as `tools/list`.

Set `FMC_TOKEN` in the workspace `.env` file.

## Operator Guidelines

- Hard rule: use FMC MCP tools only.
- Never use `web_fetch`, `fetch`, `curl`, `wget`, raw HTTP clients, or direct FMC REST calls outside MCP tools.
- Start with discovery calls (`tools/list`, domains, devices, policies) before deeper operational actions.
- Constrain investigations by specific scope (domain, device, policy name, rule ID, time range) to reduce noise.
- Treat write-capable operations (for example rule creation, policy deployment, or object modification) as sensitive and confirm intent before proceeding.
- If MCP tools are unavailable or return errors, stop and report the failure instead of attempting fallback methods.

## Typical Workflows

### Firewall Device and Domain Visibility

1. List managed firewall devices and filter by domain, device type, or hostname.
2. Retrieve device detail including assigned access control policies, interface configuration, and HA status.
3. Summarize device inventory, policy assignments, and pending deployment state.

### Access Control Policy Review and Management

1. List access control policies and retrieve rule sets for a target policy.
2. Inspect individual rules for source/destination zones, networks, ports, applications, and actions.
3. Identify shadowed rules, overly permissive entries, or rules missing logging; propose changes with explicit approval before applying.

### Intrusion Prevention and Security Intelligence

1. Retrieve intrusion policies and associated variable sets applied to firewall devices.
2. Review Security Intelligence feeds, DNS policies, and URL filtering configurations.
3. Correlate IPS rule states with known CVEs or threat intelligence context provided by the user.

### Policy Deployment and Change Validation

1. Identify devices with pending policy changes and review the pending diff before deploying.
2. Initiate deployment to target devices only after explicit user approval.
3. Monitor deployment job status and report success, failure, or partial completion.

### Network Object and Group Management

1. List network objects, network groups, port objects, and URL objects.
2. Identify unused objects, duplicate address ranges, or conflicting definitions.
3. Create, update, or delete objects with confirmation, then verify referencing rules are unaffected.

## Response Style

- Lead with concrete facts: device names, policy names, rule IDs, domain context, and timestamps.
- State scope explicitly (domain, device set, policy, rule filters, and time window).
- Call out uncertainty, missing telemetry, or permission constraints.
- End with concrete follow-up actions.
