---
name: manage-layer-3-virtual-networks
description: Create, update, or destroy Terraform No-Code workspaces that use the nc-l3vn module to manage Layer 3 virtual networks. Use when a user asks to create, modify, update, or remove a layer 3 virtual network, VRF, routing segment, or similar routed tenant/network construct across one or more data center fabrics, campus fabrics, or firewall domains. This skill is especially for requests that must gather required inputs, explicitly ask whether optional variables should be set, and then drive Terraform workspace lifecycle actions safely.
---

# Manage Layer 3 Virtual Networks

## Overview

Use this skill to manage Terraform No-Code workspaces backed by the `nc-l3vn` module. Gather the user's intent, collect the required variables, ask whether any optional variables should be set for this workspace, summarize the plan clearly, and only then perform the requested workspace action.

## Critical constraint

**This skill must only use No-Code workspace tools.** The `nc-l3vn` module is deployed exclusively through Terraform No-Code workflows. Creating a standard workspace and then setting variables separately will not work and must never be attempted — not as a fallback, not as a workaround. If the No-Code tools are unavailable, stop and report the problem.

## Workflow

### 1. Confirm the requested lifecycle action

Classify the request into one of these actions before touching Terraform:

- **Create** a new No-Code workspace for a new Layer 3 virtual network
- **Update** an existing workspace or its variables
- **Destroy** an existing workspace
- **Inspect** an existing workspace before proposing changes

If the request is ambiguous, clarify the target action first.

### 2. Normalize the user's language

Treat these phrases as possible matches for this skill:

- layer 3 virtual network
- L3 virtual network
- virtual routing network
- VRF
- routing segment
- routed segment
- routed tenant segment

Map them to the same underlying concept: a Terraform No-Code workspace using the `nc-l3vn` module.

### 3. Discover existing Terraform scope first

Before creating or changing anything:

1. List Terraform organizations if needed.
2. List workspaces in the target organization.
3. For update or destroy requests, identify the exact target workspace by name.
4. If multiple workspaces are plausible matches, ask the user to choose the exact one.

Do not guess the target workspace when multiple similar names exist.

### 4. Collect required variables

For **create** requests, gather the required minimum inputs before creating the workspace.

Required input checklist:

- **Workspace name**
- **Workspace description**
- **VRF / Layer 3 virtual network name**
- **VRF number / identifier**
- **VRF description**
- **Inter-domain prefix**
- **Loopback prefix**

When the user gives partial information, ask only for the missing pieces.

### 5. Always ask about deployment domains

For every **create** request, always explicitly ask about all three deployment domain categories — even when the user has already mentioned one or two. Never assume a category is empty because the user did not mention it.

Ask for each of the following in a single prompt:

- **Campus / SDA fabrics** (`campus_sites`): which campus fabric sites, if any, should the L3VN be extended to?
- **Data centre fabrics** (`dc_fabrics`): which DC fabrics, if any, should the L3VN be extended to?
- **Firewall domains** (`fw_domains`): which firewall domains, if any, should the L3VN be peered with?

If the user confirms a category is not needed, record it as an empty list and proceed. Never silently omit a category or default it to empty without asking.

### 6. Explicitly ask about optional variables

After the required variables are known, always ask whether the user wants to set any optional variables for this specific workspace.

Use a prompt pattern like this:

- “I have the required values. Do you also want to set any optional variables for this workspace?”
- “If yes, tell me which optional settings you want to include. If no, I’ll proceed with just the required values.”

If optional variables exist in the module interface or in the existing workspace, enumerate them clearly. Read `references/nc-l3vn-variables.md` for a practical required/optional variable checklist and prompting pattern. If the optional set is not yet known from live module data, use the reference file as a guide and ask the user whether they want the default optional settings only, or whether they want you to inspect the module/workspace inputs first.

Never silently omit optional-variable discussion on create requests.

### 7. Summarize before write actions

Before any create, update, or destroy action, provide a compact confirmation summary containing:

- Lifecycle action
- Organization
- Workspace name
- Module context: `nc-l3vn`
- Required variables to be set or changed
- Optional variables to be set or left at defaults
- Whether the action is create, update, or destroy

For destructive actions, explicitly state that the action may remove managed infrastructure.

### 8. Execute the Terraform action safely

Use Terraform MCP tools only. All create and update operations **must** use the No-Code workspace tools exclusively.

**Hard rule: if `create_no_code_workspace` is unavailable or fails, do NOT fall back to `create_workspace` followed by `create_workspace_variable`. That approach will not work with the `nc-l3vn` module. Instead, notify the user that the No-Code tool is unavailable and stop the current workflow.**

#### Create

1. Confirm target organization.
2. Call `create_no_code_workspace` for the `nc-l3vn` module. This is the only permitted tool for this step.
3. If `create_no_code_workspace` is unavailable or returns an error:
   - Notify the user: "The `create_no_code_workspace` tool is unavailable. Cannot create this workspace. Please check the Terraform MCP server connection."
   - Stop. Do not call `create_workspace` or `create_workspace_variable` under any circumstances.
4. Supply all required and user-requested optional variables in the `create_no_code_workspace` call.
5. Re-read workspace variables or details to verify the final state.

#### Update

1. Read current workspace details and variables first.
2. Show the variables that will change.
3. Use the **No-Code workspace update tool** to apply changes. Do not use generic variable-set tools as a substitute.
4. Re-read the workspace variables after the change.

#### Destroy

1. Identify the exact workspace.
2. Make clear that destroy is destructive.
3. Confirm intent explicitly.
4. Use the appropriate Terraform MCP workflow for deletion or destructive run handling.
5. Report completion and any follow-up state.

If any No-Code workspace tool is unavailable or returns an error, stop and report the failure. Do not attempt workarounds using standard workspace or variable tools.

## Variable handling rules

### Required-variable behavior

Treat required variables as mandatory inputs for create operations. If any required value is missing, ask for it before continuing.

### Optional-variable behavior

For optional variables:

- Always ask whether the user wants to set them.
- If the user declines, proceed with defaults.
- If the user is unsure, offer to inspect the existing module/workspace inputs first.
- If updating an existing workspace, show current optional-variable values before changing them.

### Existing workspace updates

When updating an existing `nc-l3vn` workspace:

- Read current variables first.
- Preserve unchanged values.
- Only alter the keys the user requested.
- Restate the resulting changed values after the write.

## Response style

Lead with concrete facts:

- organization
- workspace name
- lifecycle action
- targeted fabrics / firewall domains
- variables to be set or changed

Keep prompts structured and short. For input collection, prefer checklists and compact bullet lists over long prose.

## Safe prompting pattern

When enough information is missing, use a form-like prompt such as:

- Workspace name:
- Workspace description:
- VRF name:
- VRF number:
- VRF description:
- Inter-domain prefix:
- Loopback prefix:
- Campus / SDA fabrics (campus_sites — list all sites, or "none"):
- Data centre fabrics (dc_fabrics — list all fabrics, or "none"):
- Firewall domains (fw_domains — list all domains, or "none"):
- Optional variables to set (if any):

Always include the three domain fields in this prompt, even when the user has already supplied some values. Fill in the known answers and ask only for the blank ones.

Use this only for the missing fields; do not force the user to re-enter values they already supplied.

## Notes

- Treat Terraform writes as sensitive changes.
- For destroy requests, require explicit confirmation.
- Do not use direct HTTP calls, curl, or web fetches for Terraform Cloud or Terraform Enterprise.
- Re-read the workspace after changes so the user gets a verified end state.
