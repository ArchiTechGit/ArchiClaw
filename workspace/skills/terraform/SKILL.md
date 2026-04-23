---
name: terraform-cloud
description: Terraform Cloud MCP skill using the "terraform" MCP server for Terraform Registry and HCP Terraform / Terraform Enterprise workflows.
version: 1.0.0
tags: [terraform, terraform-cloud, hcp-terraform, tfe, mcp, iac, registry, workspaces]
---

# Terraform Cloud MCP Server

## Purpose

Use this skill when users need Terraform Cloud or Terraform Enterprise data and actions through MCP tools, including workspace discovery, run analysis, registry lookups, and Terraform workflow support.

## MCP Server

This skill uses the `terraform` MCP server provided by HashiCorp Terraform MCP Server.  This is run as a docker container accesible through the NemoClaw default network bridge.

- Repository: hashicorp/terraform-mcp-server
- Repository URL: [hashicorp/terraform-mcp-server](https://github.com/hashicorp/terraform-mcp-server)
- Server name: `terraform`
- Transport support: stdio and Streamable HTTP
- Default HTTP endpoint: `http://tfe_mcp:8080/mcp`

## OpenClaw Access Pattern

Use the local MCP client script in this workspace to call the Terraform MCP server:

```bash
workspace/scripts/mcp-client.js --url http://tfe_mcp:8080/mcp --method XXXX
```

Replace `XXXX` with the MCP method you need, such as `tools/list`.

## Operator Guidelines

- Hard rule: use Terraform MCP tools only.
- Never use `web_fetch`, `fetch`, `curl`, `wget`, raw HTTP clients, direct Terraform Cloud REST calls, or any non-MCP mechanism for Terraform Cloud data retrieval.
- Start with discovery calls (`tools/list`, list workspaces, list organizations) before detail calls.
- For run investigations, constrain by organization, workspace, and time window when possible.
- Treat write-capable operations as sensitive and confirm intent before proceeding.
- If MCP tools are unavailable or return errors, stop and report the failure instead of attempting fallback methods.

## Typical Workflows

### Workspace Discovery

1. List organizations and projects in scope.
2. List workspaces for the selected organization/project.
3. Summarize workspace purpose, state, and ownership context.

### Run and Plan Triage

1. Locate recent runs for a workspace.
2. Retrieve plan/apply details and status.
3. Summarize failure points, policy checks, and next actions.

### Registry Research

1. Search providers/modules relevant to the request.
2. Inspect version and documentation metadata.
3. Recommend safe next steps for Terraform configuration updates.

## Response Style

- Lead with concrete facts: organization, workspace, run IDs, status, and timestamps.
- State scope explicitly: Terraform Cloud vs Terraform Enterprise, plus active address.
- Call out uncertainty, missing access, or permission constraints.
- End with concrete follow-up actions.
