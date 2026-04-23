# nc-l3vn Variables Reference

Use this reference when the user wants help creating, updating, or reviewing a Terraform No-Code workspace that uses the `nc-l3vn` module.

This file is intentionally pragmatic rather than authoritative. If the actual module input schema is available from Terraform Cloud or the module definition, prefer the live module interface. Use this file as a prompt-and-structure guide.

## Required variables

These are the variables the skill should try to gather before creating a new workspace.

- `workspace_name`
  - Human-readable Terraform workspace name for this module instance
  - Example: `NC-VRF-2`

- `workspace_description`
  - Description of the Terraform workspace for this module instance
  - Example: `Clinical routing segment — Bendigo Hospital`

- `vrf_name`
  - Name of the VRF instance. Must contain only letters, numbers, and underscores
  - Example: `NCVRF2`

- `vrf_number`
  - Unique numeric VRF identifier. Valid range: 101–395, excluding 204
  - Example: `162`

- `vrf_inter_domain_prefix`
  - IPv4 CIDR prefix to allocate inter-domain peering subnets from. Typically /25 or larger
  - Example: `192.168.251.0/25`

- `vrf_loopback_prefix`
  - IPv4 CIDR prefix used to assign /32 loopbacks to devices in the VRF. Typically /26 or larger
  - Example: `192.168.251.128/26`

## Common optional variables

Always ask the user whether any optional variables should be set.

### Core VRF

- `vrf_description`
  - Human-readable description of the VRF instance
  - Default: `null`
  - Example: `Clinical routing segment`

- `vrf_enable_multicast`
  - Enable multicast routing on this VRF
  - Default: `false`

- `vrf_enable_inter_domain_peering`
  - Enable automatic Layer 3 peering between VRF instances across domains
  - Default: `true`

### Campus / SDA Fabric

- `campus_sites`
  - List of Campus SDA fabric sites to attach the VRF. Must use full site hierarchy format
  - Default: `[]`
  - Example: `["Global/Bendigo Hospital Campus"]`

- `sda_multicast_ip_pool_name`
  - SDA multicast signalling IP pool name. Required if `vrf_enable_multicast` is `true` and VRF extends to SDA fabric(s)
  - Default: `null`

- `sda_multicast_ipv4_ssm_ranges`
  - List of IPv4 SSM ranges for SDA multicast
  - Default: `["232.0.0.0/8"]`

- `sda_multicast_rp_fabric_devices`
  - List of SDA fabric node names to configure as multicast Rendezvous Points. Required if `vrf_multicast_rp_location` is set to an SDA fabric name
  - Default: `[]`

### Data Centre / NDFC Fabric

- `dc_fabrics`
  - List of DC fabric names to deploy the VRF to. For Nexus Dashboard, use standalone fabric or MSD name
  - Default: `[]`
  - Example: `["Bendigo_Health_DC"]`

- `dc_attached_switches`
  - Map of DC fabrics to specific switch lists. Use when per-switch attachment is needed rather than full fabric deployment
  - Default: `{}`

- `ndfc_enable_per_vrf_loopback`
  - Automatically create per-switch loopback interfaces for this VRF
  - Default: `true`

- `ndfc_vrf_sym_vlan_id`
  - Manually configured symmetric IRB VLAN ID. Defaults to fabric minimum + `vrf_number` if not set. Valid range: 1–4094
  - Default: `null`

- `ndfc_vrf_l3_vni`
  - Manually configured Layer 3 VNI. Defaults to fabric minimum + `vrf_number` if not set. Valid range: 1–16777215
  - Default: `null`

- `ndfc_vrf_loopback_id`
  - Loopback interface ID for per-VRF loopbacks. Valid range: 2–1023, excluding 100
  - Default: `null`

- `ndfc_vrf_enable_freeform`
  - Generate CLI freeform for Border switches as a workaround for native VRF-lite/L3Out support
  - Default: `true`

- `ndfc_enable_host_routes`
  - Allow DC Borders to advertise host routes via eBGP
  - Default: `false`

- `ndfc_advertise_default_route`
  - Allow VRF to advertise a default route if learnt externally, or a static default if configured
  - Default: `true`

- `ndfc_configure_static_default_route`
  - Configure a static 0/0 default route on this VRF. Required to advertise a default route when none is learnt externally
  - Default: `false`

- `ndfc_mc_rp_loopback_id`
  - Loopback ID for Anycast RP when `vrf_multicast_rp_location` is set to a DC fabric name. Valid range: 2–1023, excluding 100
  - Default: `null`

- `ndfc_svc_l2_vni`
  - Manually configured L4-7 Service Network Layer 2 VNI. Valid range: 1–16777215
  - Default: `null`

- `ndfc_svc_vlan_id`
  - Manually configured L4-7 Service Network VLAN ID. Valid range: 1–4094
  - Default: `null`

- `ndfc_svc_vpc_peer_vlan_id`
  - Manually configured L4-7 Service VPC Peering VLAN ID. Valid range: 1–4094
  - Default: `null`

- `ndfc_svc_route_map_out`
  - Route-map for redistributing routes from L4-7 services. Empty string uses the NDFC default route-map
  - Default: `""`

- `ndfc_svc_advertise_host_route`
  - Allow host routes to be advertised to and from L4-7 services (e.g. firewalls)
  - Default: `false`

### Firewall Domains

- `fw_domains`
  - List of firewall domain names to attach the new VRF to
  - Default: `[]`
  - Example: `["FTD_Pair_1"]`

- `fw_use_global_rt`
  - Use the global routing table instead of a separate virtual router instance. Typically used for Fusion Firewall configurations
  - Default: `true`

- `fmc_deploy`
  - Automatically deploy configuration changes in Cisco Secure FMC
  - Default: `true`

### Multicast RP

- `vrf_multicast_rp_location`
  - Fabric or site name where the multicast Rendezvous Point is located. Set to `null` if RP is external to all managed fabrics
  - Default: `null`

- `vrf_multicast_rp_ip_address`
  - IPv4 address of the multicast Rendezvous Point. Required if multicast is enabled
  - Default: `null`
  - Example: `10.1.1.100`

- `vrf_underlay_multicast_address`
  - IPv4 multicast address used for VRF multicast distribution (TRM) across the underlay. Does not need to be unique per VRF
  - Default: `239.1.1.1`

### Netbox / IPAM

- `netbox_tags`
  - List of tags to assign to Netbox objects created for this VRF
  - Default: `["Terraform"]`

## Prompting pattern

After collecting required values, ask:

- "I have the required values. Do you want to set any optional variables for this `nc-l3vn` workspace, or should I use defaults?"

If the user says yes, offer this compact list:

- Optional variables to set:
  - vrf_description:
  - campus_sites:
  - dc_fabrics:
  - fw_domains:
  - vrf_enable_multicast:
  - fmc_deploy:
  - netbox_tags:
  - any NDFC-specific or multicast variables:

## Update workflow guidance

When modifying an existing workspace:

1. Read the current workspace variables first.
2. Show the current value and requested new value for each changed field.
3. Preserve all unspecified variables.
4. Re-read the workspace after the update.

## Destroy workflow guidance

For destroy requests, confirm these items explicitly:

- exact workspace name
- organization
- whether the user wants the workspace removed or a destroy run initiated
- acknowledgement that managed infrastructure may be removed

## Examples

### Minimal create request

User request:

- "Create a VRF called NCVRF2 in Bendigo_Health_DC and Global/Bendigo Hospital Campus."

Missing fields the skill should ask for:

- workspace name and description
- vrf_number
- vrf_description
- vrf_inter_domain_prefix
- vrf_loopback_prefix
- whether any firewall domains are needed (fw_domains)
- whether any optional variables should be set

### Update request

User request:

- "Update NC-VRF-1 and change the description to Radiology segment."

Skill behavior:

- identify the workspace
- read current variables
- update only `vrf_description`
- verify the updated value

### Destroy request

User request:

- "Destroy the routing segment workspace NC-VRF-1."

Skill behavior:

- identify the exact workspace
- warn that the action is destructive
- confirm intent explicitly
- execute the appropriate Terraform MCP action
- report the resulting state
