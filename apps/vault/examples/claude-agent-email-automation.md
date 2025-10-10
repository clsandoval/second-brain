---
title: Business Automation with Claude Agent SDK and Composio
type: example
tags: [agent, claude-agent-sdk, composio, automation, hooks, subagents, mcp, tool-orchestration, shopify, hubspot, contracts, spreadsheets, calendar]
created: 2025-10-10
updated: 2025-10-10
---

# Business Automation with Claude Agent SDK and Composio

## Overview

This example demonstrates building autonomous business process automation agents using [[claude-agent-sdk]] integrated with [[composio]] tools. The pattern replaces rigid multi-phase orchestration with Claude's flexible agent loop, enabling dynamic tool selection, parallel processing, and intelligent iteration.

**Key Innovation**: Combining Claude SDK's autonomous agent capabilities with Composio's 250+ authenticated tools to create business automation workflows that handle irregular, criteria-driven tasks better than fixed workflow approaches. Claude's native analysis handles data extraction, eliminating the need for custom business logic tools.

**Use Cases**:
- **Spreadsheet Updates**: Monitor email threads and update Google Sheets with extracted data
- **Contract Generation**: Generate contracts when specific criteria are met in email threads
- **E-commerce Operations**: Create Shopify discount codes and draft orders based on thread criteria
- **Calendar Management**: Check schedules, send invites, coordinate meetings
- **CRM Updates**: Automatically update HubSpot based on email interactions

**Technologies:**
- **[[claude-agent-sdk]]**: Autonomous agent framework with built-in loop, hooks, subagents
- **[[composio]]**: Tool integration platform providing authenticated access to Shopify, HubSpot, Google Sheets, Calendar, etc.
- **Custom Tools**: Pass directly like Composio tools (recommended), or use [[model-context-protocol|MCP]] for reusable tool libraries
- **Python asyncio**: Async execution for parallel subagent processing

## The Simple Approach

**No hardcoded workflow logic!** Just three things:

1. **Define workflows** - prompts describing what to do + tool whitelists:
   ```python
   WORKFLOWS = {
       "contract_generation": WorkflowConfig(
           prompt="Generate contract when criteria met...",
           allowed_tools=["HUBSPOT_*", "GOOGLESHEETS_*", ...]
       )
   }
   ```

2. **Classify** - which workflows apply to this thread?
   ```python
   workflows = await classify_workflows(thread)
   # Returns: ["contract_generation", "crm_update"]
   ```

3. **Execute** - let Claude Agent SDK handle everything:
   ```python
   result = await run_workflows(thread, context, settings)
   # Claude figures out: tool orchestration, parallel execution,
   # error handling, when to stop - EVERYTHING
   ```

That's it! No `if workflow_type == "contract"` logic. No hardcoded orchestration. Claude does it all.

## Architecture

**Key Principle**: **NO HARDCODED WORKFLOW LOGIC**

```
Email Thread
      │
      ▼
┌─────────────────────────┐
│  Workflow Classifier     │  ← Simple LLM call: which workflows apply?
│  (1 LLM call)           │
└───────────┬─────────────┘
            │
            ▼
    [contract_generation, crm_update]  ← Workflow names
            │
            ▼
┌─────────────────────────┐
│  Collect Tools          │  ← Merge allowed_tools from workflows
│  & Build Prompt         │  ← Combine workflow prompts
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│           Claude Agent SDK (ClaudeSDKClient)            │
│                                                         │
│  system_prompt: "Execute: contract_generation,          │
│                  crm_update. Work autonomously."        │
│                                                         │
│  allowed_tools: [HUBSPOT_*, GOOGLESHEETS_*,            │
│                  SHOPIFY_*, GOOGLECALENDAR_*,          │
│                  create_shopify_discount_code, ...]    │
│                                                         │
│  → Agent figures out EVERYTHING:                        │
│    - Which tools to call                                │
│    - In what order                                      │
│    - Parallel execution                                 │
│    - Error handling                                     │
│    - When to stop                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Hooks (validation)   │  ← Only for safety checks
            └───────────────────────┘
                        │
                        ▼
            ┌────────────────────────────────┐
            │  Composio + Custom Tools       │
            │  (Direct or MCP - your choice) │
            └────────────────────────────────┘
```

**What you configure:**
1. **Workflow definitions** (`WORKFLOWS` dict) - just prompts + tool whitelists
2. **Custom tools** (optional) - Pass directly like Composio tools, or use MCP for reusability
3. **Hooks** (optional) - safety validations

**What Claude Agent SDK handles:**
- Everything else! Tool orchestration, parallel execution, error recovery, iteration
- Claude extracts data from threads using its native analysis capabilities
- Business logic is mostly handled by Claude + Composio tools directly

**Key Insight**: Custom tools work just like Composio tools - define them in Anthropic format and pass via `tools` parameter. No MCP required unless you need reusability.

### Agent Flow

**Traditional Multi-Phase Approach:**
```
Classify → Define State → Plan → Execute → Validate → Summarize → Repeat
  (LLM)      (LLM)        (LLM)    (API)     (LLM)       (LLM)
```
**13 LLM calls per execution**

**Claude Agent SDK Approach:**
```
Initial Query → [Autonomous Agent Loop with Hooks] → Final Output
    (LLM)       │                                 │
                ├─ Tool Selection (LLM)           │
                ├─ Tool Execution (Composio)      │
                ├─ Validation (Hook - no LLM)     │
                └─ Context Management (automatic) │
                   Repeat until complete          │
```
**3-4 LLM calls per execution (67% reduction)**

## Core Components

### 1. Workflow Configuration

Define workflows as simple configs with prompts and tool whitelists:

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class WorkflowConfig:
    """Configuration for a business automation workflow"""
    name: str
    description: str  # For classifier
    prompt: str  # Instructions for the agent
    allowed_tools: List[str]  # Whitelisted tools
    priority: int = 0  # For handling multiple matching workflows

# Define all available workflows
WORKFLOWS = {
    "contract_generation": WorkflowConfig(
        name="contract_generation",
        description="Generate contracts when pricing, scope, timeline, and payment terms are all confirmed in thread",
        prompt="""Generate a contract from the email thread.

Steps:
1. Validate ALL criteria are met:
   - Pricing confirmed by both parties
   - Scope of work clearly defined
   - Timeline/dates established
   - Payment terms agreed upon
2. If ANY criteria missing, list what's needed and STOP
3. If all criteria met:
   - Extract contract data from thread (use your analysis capabilities)
   - Generate contract document using Write tool
   - Update HubSpot: create/update contact, create deal (stage: Proposal Sent)
   - Log to Google Sheets audit trail
   - If kickoff meeting mentioned, schedule it

Do NOT generate contracts with incomplete information.""",
        allowed_tools=[
            "HUBSPOT_CREATE_CONTACT", "HUBSPOT_UPDATE_CONTACT",
            "HUBSPOT_CREATE_DEAL", "HUBSPOT_UPDATE_DEAL", "HUBSPOT_CREATE_NOTE",
            "HUBSPOT_SEARCH_CONTACTS",
            "GOOGLESHEETS_APPEND_VALUES", "GOOGLESHEETS_GET_VALUES",
            "GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_SEND_INVITE",
            "Read", "Write"
        ]
    ),

    "shopify_order": WorkflowConfig(
        name="shopify_order",
        description="Create Shopify discount codes and draft orders when customer requests products with pricing",
        prompt="""Process Shopify order from email thread.

Steps:
1. Extract order details from thread: customer email, products, quantities, pricing
2. Validate customer eligibility for discount (if mentioned):
   - Use SHOPIFY_GET_CUSTOMER to check purchase history
   - Check order value meets minimum requirements
3. If eligible and custom tool available, use create_shopify_discount_code
   to generate discount details, then execute with SHOPIFY_GRAPHQL_TOOL
   Otherwise, use SHOPIFY_CREATE_DISCOUNT_CODE directly
4. Create draft order with SHOPIFY_CREATE_DRAFT_ORDER
5. Apply discount if created
6. Log order to tracking spreadsheet with GOOGLESHEETS_APPEND_VALUES
7. Update HubSpot contact with order note

Validation:
- Customer email required
- At least 1 product required
- Order total under $10k (otherwise flag for approval)
- Max 50% discount without approval""",
        allowed_tools=[
            "SHOPIFY_CREATE_DRAFT_ORDER", "SHOPIFY_GET_CUSTOMER",
            "SHOPIFY_UPDATE_ORDER", "SHOPIFY_GRAPHQL_TOOL",
            "HUBSPOT_UPDATE_CONTACT", "HUBSPOT_CREATE_NOTE",
            "HUBSPOT_SEARCH_CONTACTS",
            "GOOGLESHEETS_APPEND_VALUES",
            "create_shopify_discount_code"  # Custom tool (if added)
        ]
    ),

    "spreadsheet_update": WorkflowConfig(
        name="spreadsheet_update",
        description="Extract structured data from threads and update Google Sheets tracking",
        prompt="""Extract data from email thread and update spreadsheet.

Steps:
1. Identify what business data needs tracking
2. Extract structured data from unstructured thread (use your analysis)
3. Validate extracted data completeness
4. Append or update appropriate spreadsheet with GOOGLESHEETS tools
5. Verify write succeeded by checking response

Handle missing data gracefully. Use proper formatting (dates, currency, percentages).""",
        allowed_tools=[
            "GOOGLESHEETS_UPDATE_VALUES", "GOOGLESHEETS_APPEND_VALUES",
            "GOOGLESHEETS_GET_VALUES", "GOOGLESHEETS_BATCH_UPDATE"
        ]
    ),

    "crm_update": WorkflowConfig(
        name="crm_update",
        description="Update HubSpot CRM with contact info, deals, and notes from email threads",
        prompt="""Update HubSpot CRM based on email thread.

Steps:
1. Extract contact/lead information from thread (use your analysis)
2. Check if contact already exists using HUBSPOT_SEARCH_CONTACTS
3. If exists: UPDATE contact with new info
4. If not: CREATE contact
5. If deal/opportunity mentioned: create or update deal
6. Add detailed note with thread context
7. Set appropriate deal stage based on conversation

Always check for existing records first. Link deals to contacts.""",
        allowed_tools=[
            "HUBSPOT_CREATE_CONTACT", "HUBSPOT_UPDATE_CONTACT",
            "HUBSPOT_CREATE_DEAL", "HUBSPOT_UPDATE_DEAL",
            "HUBSPOT_CREATE_NOTE", "HUBSPOT_SEARCH_CONTACTS",
            "HUBSPOT_GET_CONTACT"
        ]
    ),

    "calendar_coordination": WorkflowConfig(
        name="calendar_coordination",
        description="Schedule meetings and send calendar invites when meeting discussed in thread",
        prompt="""Coordinate calendar based on email thread.

Steps:
1. Extract meeting requirements from thread: duration, attendees, topic, time preferences
2. Check calendar availability using GOOGLECALENDAR_LIST_EVENTS
3. Find 2-3 optimal time slots (respect working hours 9am-5pm)
4. Create calendar event with GOOGLECALENDAR_CREATE_EVENT
5. Add Google Meet link via conferencing settings
6. Send invites ONLY when all parties have confirmed availability

Include agenda from thread in event description.""",
        allowed_tools=[
            "GOOGLECALENDAR_FIND_FREE_TIME", "GOOGLECALENDAR_CREATE_EVENT",
            "GOOGLECALENDAR_SEND_INVITE", "GOOGLECALENDAR_LIST_EVENTS",
            "GOOGLECALENDAR_GET_EVENT"
        ]
    )
}
```

### 2. Custom Tool: Shopify Discount Creation via GraphQL

**You have two options for custom tools:**

#### Option A: Direct Tool Definition (Simpler - Recommended)

Pass custom tools directly without MCP:

```python
import random
import string

# Define tool in Anthropic format
def create_shopify_discount_code_tool():
    return {
        "name": "create_shopify_discount_code",
        "description": "Create a Shopify discount code using GraphQL with automatic code generation",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "discount_type": {"type": "string", "enum": ["PERCENTAGE", "FIXED_AMOUNT"]},
                "value": {"type": "number"},
                "customer_email": {"type": "string"},
                "minimum_order_value": {"type": "number"},
                "usage_limit": {"type": "integer"}
            },
            "required": ["title", "discount_type", "value", "customer_email"]
        }
    }

async def execute_create_shopify_discount_code(args):
    """Execute the discount code creation logic"""
    title = args['title']
    discount_type = args['discount_type']
    value = args['value']
    customer_email = args['customer_email']
    minimum_order = args.get('minimum_order_value', 0)
    usage_limit = args.get('usage_limit', 1)

    # Generate unique discount code
    code = f"DISCOUNT-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

    # Build GraphQL mutation and variables (simplified for brevity)
    graphql_query = """
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode { id }
        userErrors { field message }
      }
    }
    """

    variables = {
        "basicCodeDiscount": {
            "title": title,
            "code": code,
            "customerGets": {"value": {"percentage": value / 100 if discount_type == "PERCENTAGE" else None}},
            "usageLimit": usage_limit
        }
    }

    return {
        "graphql_query": graphql_query,
        "graphql_variables": variables,
        "discount_code": code
    }

# Usage with Claude Agent SDK
custom_tools = [
    create_shopify_discount_code_tool()  # Tool definition
]

# Map tool names to executor functions
custom_tool_executors = {
    "create_shopify_discount_code": execute_create_shopify_discount_code
}

# Pass to agent
options = ClaudeAgentOptions(
    tools=composio_tools + custom_tools,  # ✅ Mix Composio + custom tools!
    tool_executors=custom_tool_executors,  # Execution handlers
    allowed_tools=[...]
)
```

**Pros**: Simple, no MCP server needed, easy to test
**Cons**: Tools tied to this specific agent instance

---

#### Option B: MCP Server (For Reusability)

Use MCP when you want reusable tool servers:

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool(
    "create_shopify_discount_code",
    "Create a Shopify discount code using GraphQL",
    {"title": str, "discount_type": str, "value": float}
)
async def create_shopify_discount_code(args):
    # Same implementation as above
    title = args['title']
    code = f"DISCOUNT-{random.randint(1000, 9999)}"
    # ... build GraphQL query ...
    return {"discount_code": code, "graphql_query": "..."}

# Create MCP server
def create_discount_tool_mcp_server():
    return create_sdk_mcp_server(
        name="shopify-discount-wrapper",
        version="1.0.0",
        tools=[create_shopify_discount_code]
    )

# Pass to agent
options = ClaudeAgentOptions(
    tools=composio_tools,
    mcp_servers={
        "shopify_discount": create_discount_tool_mcp_server()
    }
)
```

**Pros**: Reusable across multiple agents, better for complex tool sets
**Cons**: More boilerplate

---

**Recommendation**: Use **Option A (direct tools)** for simple custom tools. Use **Option B (MCP)** when building reusable tool libraries or complex tool orchestration.

**Note**: This tool generates GraphQL mutation details, then the agent uses `SHOPIFY_GRAPHQL_TOOL` from Composio to execute it. All other business logic is handled directly by Claude with Composio tools.

### 3. Deterministic Validation Hooks

Replace LLM-based validation with fast, deterministic checks:

```python
from datetime import datetime

def validate_shopify_operation(hook_context):
    """
    PreToolUse hook: Validate Shopify operations before execution

    Checks:
    - Discount codes meet business rules
    - Draft orders have required fields
    - Order values are within limits
    - Customer exists in system

    Returns: {"allow": True/False, "reason": str}
    """
    tool_input = hook_context.tool_input
    tool_name = hook_context.tool_name

    if tool_name == "SHOPIFY_CREATE_DISCOUNT_CODE":
        # Check 1: Discount percentage within limits
        discount_value = tool_input.get('value', 0)
        max_discount = 50  # 50% max

        if discount_value > max_discount:
            return {
                "deny": True,
                "reason": f"Discount {discount_value}% exceeds maximum {max_discount}%"
            }

        # Check 2: Code format is valid
        code = tool_input.get('code', '')
        if not code or len(code) < 5:
            return {
                "deny": True,
                "reason": "Invalid discount code format"
            }

    elif tool_name == "SHOPIFY_CREATE_DRAFT_ORDER":
        # Check 1: Order has items
        line_items = tool_input.get('line_items', [])
        if not line_items:
            return {
                "deny": True,
                "reason": "Draft order must have at least one item"
            }

        # Check 2: Customer email provided
        customer_email = tool_input.get('customer', {}).get('email')
        if not customer_email:
            return {
                "deny": True,
                "reason": "Customer email required for draft order"
            }

        # Check 3: Total value within limits
        total = sum(item.get('price', 0) * item.get('quantity', 1) for item in line_items)
        if total > 10000:  # $10k limit
            return {
                "deny": True,
                "reason": f"Order total ${total:.2f} exceeds $10,000 limit. Requires manual approval."
            }

    return {"allow": True}


def validate_crm_operation(hook_context):
    """
    PreToolUse hook: Validate HubSpot CRM operations

    Checks:
    - Required fields present
    - Deal values are realistic
    - No duplicate contacts
    - Valid pipeline stages
    """
    tool_input = hook_context.tool_input
    tool_name = hook_context.tool_name

    if tool_name == "HUBSPOT_CREATE_DEAL":
        # Check 1: Required fields
        required_fields = ['dealname', 'amount', 'dealstage', 'pipeline']
        missing_fields = [f for f in required_fields if f not in tool_input.get('properties', {})]

        if missing_fields:
            return {
                "deny": True,
                "reason": f"Missing required fields: {', '.join(missing_fields)}"
            }

        # Check 2: Deal amount is reasonable
        amount = tool_input.get('properties', {}).get('amount', 0)
        if amount > 1000000:  # $1M limit
            return {
                "deny": True,
                "reason": f"Deal amount ${amount:,.0f} exceeds $1M limit. Requires manual review."
            }

        # Check 3: Valid pipeline stage
        stage = tool_input.get('properties', {}).get('dealstage')
        valid_stages = get_valid_deal_stages()
        if stage not in valid_stages:
            return {
                "deny": True,
                "reason": f"Invalid deal stage: {stage}"
            }

    elif tool_name == "HUBSPOT_CREATE_CONTACT":
        # Check for duplicate
        email = tool_input.get('properties', {}).get('email')
        if email and contact_exists(email):
            return {
                "deny": True,
                "reason": f"Contact already exists: {email}. Use UPDATE instead of CREATE."
            }

    return {"allow": True}


def validate_calendar_invite(hook_context):
    """
    PreToolUse hook: Validate calendar invite before sending

    Checks:
    - Event was created first
    - All parties confirmed availability
    - Meeting has required details (time, attendees, agenda)
    """
    tool_input = hook_context.tool_input

    # Check 1: Event exists
    event_id = tool_input.get('event_id')
    if not event_id:
        return {
            "deny": True,
            "reason": "Must create calendar event before sending invites"
        }

    # Check 2: Attendees confirmed
    if not hook_context.custom_data.get('attendees_confirmed'):
        return {
            "deny": True,
            "reason": "Wait for attendee confirmation before sending calendar invites"
        }

    # Check 3: Has required details
    event_details = tool_input.get('event_details', {})
    if not event_details.get('summary'):
        return {
            "deny": True,
            "reason": "Event must have a title/summary"
        }

    return {"allow": True}


def validate_sheet_update(hook_context):
    """
    PostToolUse hook: Validate Google Sheets update after execution

    Checks:
    - Data was actually written
    - Format is correct
    - No data loss occurred
    """
    tool_output = hook_context.tool_output

    # Extract update result
    updated_range = tool_output.get('updatedRange')
    updated_rows = tool_output.get('updatedRows', 0)

    # Check 1: Data was written
    if updated_rows == 0:
        return {
            "retry": True,
            "reason": "No rows were updated. Retrying..."
        }

    # Check 2: Expected range
    expected_rows = hook_context.custom_data.get('expected_row_count')
    if expected_rows and updated_rows != expected_rows:
        return {
            "retry": True,
            "reason": f"Expected {expected_rows} rows, but updated {updated_rows}"
        }

    # Log successful update
    log_audit_trail(
        action="sheet_update",
        range=updated_range,
        rows=updated_rows,
        timestamp=datetime.now()
    )

    return {"allow": True}


def track_tool_usage(hook_context):
    """
    PostToolUse hook: Track all tool usage for monitoring and audit
    """
    # Log to your monitoring system
    log_tool_call(
        tool_name=hook_context.tool_name,
        user_id=hook_context.custom_data.get('user_id'),
        success=not hook_context.error,
        timestamp=datetime.now(),
        tool_input=hook_context.tool_input,
        tool_output=hook_context.tool_output if not hook_context.error else None
    )

    # Track costs for Composio tool calls
    if hook_context.tool_name.startswith(("SHOPIFY_", "HUBSPOT_", "GOOGLESHEETS_")):
        increment_tool_usage_counter(hook_context.tool_name)

    return {"allow": True}
```

### 4. Workflow Classifier

Simple classifier to determine which workflows apply to a thread:

```python
async def classify_workflows(email_thread: dict, thread_context: dict) -> List[str]:
    """
    Classify which workflows are relevant for this email thread

    Uses a simple LLM call to match thread context to workflow descriptions
    """
    from anthropic import Anthropic

    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # Build workflow descriptions for classification
    workflow_descriptions = "\n".join([
        f"- {name}: {config.description}"
        for name, config in WORKFLOWS.items()
    ])

    thread_summary = f"""
Thread Subject: {email_thread.get('subject', 'N/A')}
From: {email_thread.get('from', 'N/A')}
Latest Message:
{email_thread.get('body', '')[:500]}...

Previous Messages: {len(thread_context.get('previous_emails', []))} emails
"""

    classification_prompt = f"""Analyze this email thread and determine which business workflows should be triggered.

Available Workflows:
{workflow_descriptions}

Email Thread:
{thread_summary}

Return ONLY a JSON array of workflow names that apply (e.g., ["contract_generation", "crm_update"]).
If no workflows apply, return empty array [].

Consider:
- What is being requested or discussed?
- What business actions need to happen?
- Are there multiple workflows needed?

JSON array:"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=200,
        messages=[{"role": "user", "content": classification_prompt}]
    )

    # Parse response
    import json
    workflow_names = json.loads(response.content[0].text.strip())

    # Filter to valid workflows
    valid_workflows = [name for name in workflow_names if name in WORKFLOWS]

    return valid_workflows
```

### 5. Composio + Claude Agent SDK Integration

**The Integration is Built-In and Seamless:**

```
Composio Tools → Claude Agent SDK (native support) → Agent executes
     ↓                      ↓                              ↓
  Get tools          Pass via options              Uses tools autonomously
```

**How it works:**

Composio provides tools in Claude-compatible format that can be passed directly to the agent:

```python
from composio import Composio
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

# Step 1: Get Composio tools
composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

# Fetch tools by toolkit (supports user-specific auth)
composio_tools = composio.tools.get(
    toolkits=["shopify", "hubspot", "googlesheets"],
    user_id="user@example.com"  # User's authenticated connections
)

# Step 2: Pass directly to Claude Agent SDK
options = ClaudeAgentOptions(
    system_prompt="Your automation prompt...",
    tools=composio_tools,  # ✅ Pass Composio tools directly!
    mcp_servers={
        "shopify_discount_wrapper": create_discount_tool_mcp_server()
    }
)

client = ClaudeSDKClient(options=options)
result = await client.run("Process this email thread...")
```

**Key Points:**

1. **Native Support**: Claude Agent SDK accepts Composio tools via the `tools` parameter in `ClaudeAgentOptions` - no conversion needed!
2. **Authentication**: Composio handles OAuth/API key management per user via `user_id` (each user has their own connected accounts)
3. **Tool Discovery**: Agent sees all Composio tools matching the specified toolkits (e.g., all Shopify, HubSpot, Google tools)
4. **Combined Tools**: Mix Composio tools + MCP tools + built-in tools (Read/Write) seamlessly in one agent
5. **Tool Whitelisting**: Use `allowed_tools` to restrict which specific tools the agent can call (security layer)

**What happens under the hood:**
- Composio returns tools in [Anthropic tool format](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- Claude Agent SDK merges Composio tools + MCP tools into unified tool registry
- When agent calls a Composio tool, SDK routes execution through Composio's API
- Composio executes the tool using the user's authenticated connection
- Result is returned to the agent for next iteration

**Tool Whitelisting Example:**
```python
options = ClaudeAgentOptions(
    tools=composio_tools + custom_tools,  # All tools available
    tool_executors=custom_tool_executors,  # For direct tools
    allowed_tools=[  # But only these can be called
        "HUBSPOT_CREATE_CONTACT",
        "HUBSPOT_UPDATE_CONTACT",
        "SHOPIFY_CREATE_DRAFT_ORDER",
        "GOOGLESHEETS_APPEND_VALUES",
        "create_shopify_discount_code"  # Custom tool
    ]
)
```

This pattern gives you:
- ✅ **250+ authenticated tools** from Composio
- ✅ **Custom business logic** via MCP servers
- ✅ **Fine-grained control** via whitelisting
- ✅ **Per-user authentication** for multi-tenant apps

**Summary**: Yes, it's that simple! `tools = composio.tools.get(...)` → `ClaudeAgentOptions(tools=composio_tools)` → Claude Agent SDK handles the rest. Native support out of the box.

### 7. Complete Workflow Execution Example

Here's the complete implementation showing how everything fits together:

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
from composio import Composio
from datetime import datetime
import os

async def run_workflows(
    email_thread: dict,
    thread_context: dict,
    user_settings: dict
) -> dict:
    """
    Run business automation workflows - NO hardcoded logic

    Steps:
    1. Classify which workflows apply to thread
    2. Collect allowed tools from workflows
    3. Build combined prompt
    4. Let Claude Agent SDK handle everything autonomously
    """
    start_time = datetime.now()

    # Step 1: Classify workflows
    workflow_names = await classify_workflows(email_thread, thread_context)

    if not workflow_names:
        return {
            "success": True,
            "workflows": [],
            "message": "No workflows triggered for this thread"
        }

    # Step 2: Collect tools and prompts from matched workflows
    selected_workflows = [WORKFLOWS[name] for name in workflow_names]

    # Collect all unique tools
    all_tools = set()
    for workflow in selected_workflows:
        all_tools.update(workflow.allowed_tools)

    # Build combined workflow prompt
    workflow_prompts = "\n\n---\n\n".join([
        f"**{workflow.name.upper()}**:\n{workflow.prompt}"
        for workflow in selected_workflows
    ])

    # Step 3: Define custom tools (Option A - Direct)
    custom_tools = []  # Add custom tool definitions here if needed
    custom_tool_executors = {}  # Add executors here if needed

    # Example: Uncomment to add Shopify discount tool
    # custom_tools = [create_shopify_discount_code_tool()]
    # custom_tool_executors = {"create_shopify_discount_code": execute_create_shopify_discount_code}

    # Step 4: Fetch Composio tools
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    user_id = user_settings.get("user_id", "")

    # Get all Composio toolkits needed based on allowed_tools
    toolkits = set()
    for tool in all_tools:
        if tool.startswith("SHOPIFY_"):
            toolkits.add("shopify")
        elif tool.startswith("HUBSPOT_"):
            toolkits.add("hubspot")
        elif tool.startswith("GOOGLESHEETS_"):
            toolkits.add("googlesheets")
        elif tool.startswith("GOOGLECALENDAR_"):
            toolkits.add("googlecalendar")

    # Fetch Composio tools for these toolkits
    if toolkits:
        composio_tools = composio.tools.get(
            toolkits=list(toolkits),
            user_id=user_id  # User's authenticated connections
        )
    else:
        composio_tools = []

    # Step 5: Create Claude Agent with Composio tools + custom tools
    options = ClaudeAgentOptions(
        system_prompt=f"""You are an autonomous business process automation agent.

You have been assigned these workflows to execute:
{', '.join([w.name for w in selected_workflows])}

IMPORTANT: Execute ALL assigned workflows. Work on them in parallel when possible.

Your tools and responsibilities:
{workflow_prompts}

Email Thread Context:
- Subject: {email_thread.get('subject', 'N/A')}
- From: {email_thread.get('from', 'N/A')}
- Participants: {', '.join(thread_context.get('participants', []))}

Work autonomously until all workflows are complete. Coordinate actions across systems.""",

        # Combine Composio tools + custom tools (if any)
        tools=composio_tools + custom_tools,  # Mix both!

        # Custom tool executors for direct tools (Option A)
        tool_executors=custom_tool_executors,

        # Whitelist specific tools the agent can call
        allowed_tools=list(all_tools),

        permission_mode='plan',  # Require approval for sensitive operations
        max_turns=30,

        # Add validation hooks
        hooks={
            "PreToolUse": [
                HookMatcher(
                    tool_names=["SHOPIFY_CREATE_DISCOUNT_CODE", "SHOPIFY_CREATE_DRAFT_ORDER"],
                    handler=validate_shopify_operation
                ),
                HookMatcher(
                    tool_names=["HUBSPOT_CREATE_DEAL", "HUBSPOT_UPDATE_DEAL"],
                    handler=validate_crm_operation
                ),
                HookMatcher(
                    tool_names=["GOOGLECALENDAR_SEND_INVITE"],
                    handler=validate_calendar_invite
                )
            ],
            "PostToolUse": [
                HookMatcher(handler=track_tool_usage),
                HookMatcher(
                    tool_names=["GOOGLESHEETS_APPEND_VALUES"],
                    handler=validate_sheet_update
                )
            ]
        }

        # Optional: Use MCP servers for reusable tools (Option B)
        # mcp_servers={
        #     "shopify_discount": create_discount_tool_mcp_server()
        # }
    )

    client = ClaudeSDKClient(options=options)

    # Build query with full thread context
    thread_history = "\n\n".join([
        f"[{email.get('date')}] {email.get('from')}:\n{email.get('body', '')}"
        for email in thread_context.get('previous_emails', [])
    ])

    query = f"""Process this email thread and execute all assigned workflows.

THREAD HISTORY:
{thread_history}

LATEST MESSAGE:
From: {email_thread.get('from')}
Date: {email_thread.get('date')}
Body:
{email_thread.get('body', '')}

Execute all workflows assigned to you. Work until complete."""

    # Step 5: Execute - let Claude figure everything out
    result = await client.run(query)

    duration = (datetime.now() - start_time).total_seconds()

    return {
        "success": True,
        "workflows": workflow_names,
        "output": result.output,
        "tools_used": [step.tool_name for step in result.steps if step.tool_name],
        "iterations": result.turn_count,
        "duration_seconds": duration
    }
```

### 8. Main Execution - Simple!

Just call `run_workflows` - no hardcoded logic:

```python
from langfuse import observe

@observe()
async def process_business_automation(
    email_thread: dict,
    thread_context: dict,
    user_settings: dict
) -> dict:
    """
    Process business automation - classifier determines workflows, agent executes

    That's it! No workflow_type parameter, no hardcoded handling, just:
    1. Classify
    2. Execute

    Returns:
        dict with workflows executed, output, tools used, iterations, duration
    """
    result = await run_workflows(
        email_thread=email_thread,
        thread_context=thread_context,
        user_settings=user_settings
    )

    return result
```

## Complete Example Usage

### Example 1: Contract Generation Workflow

```python
import asyncio
from composio import Composio
import os

async def main():
    # Sample email thread where contract criteria are met
    email_thread = {
        "from": "sarah.johnson@acmecorp.com",
        "to": "sales@yourcompany.com",
        "subject": "Re: Web Development Project - Ready to Move Forward",
        "date": "2025-10-10",
        "body": """Hi Team,

Perfect! I'm ready to move forward with the project.

To confirm our discussion:
- Website redesign with 5 custom pages
- E-commerce integration (Shopify)
- Total cost: $12,500
- Payment: 50% upfront, 50% on completion
- Timeline: Start Nov 1, complete by Dec 15
- Weekly progress meetings on Mondays at 2pm

Everything looks good. Please send the contract and let's get started!

Best,
Sarah Johnson
Director of Marketing, Acme Corp
sarah.johnson@acmecorp.com"""
    }

    thread_context = {
        "previous_emails": [
            {
                "from": "sales@yourcompany.com",
                "date": "2025-10-08",
                "body": "Thank you for your interest! For this project, our quote is $12,500..."
            },
            {
                "from": "sarah.johnson@acmecorp.com",
                "date": "2025-10-09",
                "body": "The pricing works for us. Can we start November 1st?"
            }
        ],
        "participants": ["sarah.johnson@acmecorp.com", "sales@yourcompany.com"],
        "start_date": "2025-10-08"
    }

    user_settings = {
        "user_id": "sales@yourcompany.com",
        "timezone": "America/New_York",
        "working_hours": "9am-5pm",
        "team_email": "team@yourcompany.com"
    }

    # Process - classifier automatically determines workflows!
    result = await process_business_automation(
        email_thread=email_thread,
        thread_context=thread_context,
        user_settings=user_settings
    )

    print(f"Success: {result['success']}")
    print(f"Workflows Executed: {', '.join(result['workflows'])}")
    print(f"Tools Used: {', '.join(result['tools_used'])}")
    print(f"Iterations: {result['iterations']}")
    print(f"Duration: {result['duration_seconds']:.2f}s")
    print(f"\nOutput:\n{result['output']}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Example 2: Shopify Order Workflow

```python
async def shopify_order_example():
    # Email requesting bulk order with discount
    email_thread = {
        "from": "mike@retailstore.com",
        "to": "orders@yourstore.com",
        "subject": "Bulk Order Request - Returning Customer",
        "date": "2025-10-10",
        "body": """Hi,

I'd like to place another order:
- Product A: 50 units @ $25/unit
- Product B: 30 units @ $40/unit
- Product C: 20 units @ $15/unit

Total: $2,750

As a returning customer, can I get the usual 15% discount?

Ship to same address as last time.

Thanks,
Mike Chen
mike@retailstore.com"""
    }

    thread_context = {
        "previous_emails": [],
        "participants": ["mike@retailstore.com", "orders@yourstore.com"]
    }

    user_settings = {
        "user_id": "orders@yourstore.com",
        "timezone": "America/Los_Angeles"
    }

    # Process - classifier automatically determines workflows!
    result = await process_business_automation(
        email_thread=email_thread,
        thread_context=thread_context,
        user_settings=user_settings
    )

    print(f"Success: {result['success']}")
    print(f"Workflows Executed: {', '.join(result['workflows'])}")
    print(f"Duration: {result['duration_seconds']:.2f}s")
    print(f"\nOutput:\n{result['output']}")

if __name__ == "__main__":
    asyncio.run(shopify_order_example())
```

### Expected Output

```
Success: True
Workflows Executed: contract_generation, crm_update, calendar_coordination
Tools Used: Write, HUBSPOT_SEARCH_CONTACTS, HUBSPOT_CREATE_CONTACT, HUBSPOT_CREATE_DEAL, HUBSPOT_CREATE_NOTE, GOOGLESHEETS_APPEND_VALUES, GOOGLECALENDAR_CREATE_EVENT, GOOGLECALENDAR_SEND_INVITE
Iterations: 10
Duration: 3.8s

Output:
I've analyzed the email thread and all criteria for contract generation are met. I've executed three workflows in parallel:

CONTRACT GENERATION:
✅ Contract Generated
- Contract Number: CTR-2025-0042
- Client: Acme Corp (Sarah Johnson)
- Service: Website redesign with 5 custom pages + e-commerce integration
- Amount: $12,500
- Payment Terms: 50% upfront ($6,250), 50% on completion
- Timeline: Nov 1 - Dec 15, 2025
- File: /workspace/contracts/contract_CTR-2025-0042_Acme_Corp.pdf

CRM UPDATE:
✅ HubSpot Updated
- Contact searched and created: Sarah Johnson (sarah.johnson@acmecorp.com)
  - Company: Acme Corp
  - Title: Director of Marketing
- Deal created: "Acme Corp - Website Redesign"
  - Amount: $12,500
  - Stage: Proposal Sent
  - Close Date: Dec 15, 2025
- Note added with full contract details and thread context
- Spreadsheet audit log updated (Contracts Tracker 2025)

CALENDAR COORDINATION:
✅ Kickoff Meeting Scheduled
- Event: "Project Kickoff - Acme Corp Website Redesign"
- Date: Monday, Nov 4, 2025 at 2:00 PM EST
- Duration: 60 minutes (as requested - weekly meetings)
- Attendees: sarah.johnson@acmecorp.com, team@yourcompany.com
- Google Meet link: https://meet.google.com/xyz-abcd-efg
- Invites sent to all participants

All workflows completed successfully. Contract ready for delivery, CRM fully updated, and kickoff meeting scheduled.
```

**Key Points**:
- **Classifier automatically identified 3 workflows** based on email content
- **Agent executed all workflows autonomously** - no hardcoded orchestration
- **Parallel execution** - agent coordinated across multiple systems simultaneously
- **10 iterations** - agent iterated efficiently with Composio tools
- **3.8 seconds total** - fast execution with automatic parallelization

## Benefits for Business Automation

### 1. Reduced LLM Costs

**Current Multi-Phase Approach:**
- 13 LLM calls per execution
- Cost: ~$0.24/execution
- At 10,000 emails/month: $2,400/month

**Claude SDK Approach:**
- 3-4 LLM calls per execution
- Cost: ~$0.08/execution
- At 10,000 emails/month: $800/month
- **Savings: $1,600/month (67% reduction)**

### 2. Faster Execution

**Sequential Execution (current):**
```
Step 1: 1.2s → Step 2: 2.1s → Step 3: 1.8s → Step 4: 1.5s
Total: 6.6 seconds
```

**Parallel Subagents (Claude SDK):**
```
Calendar Agent (2.1s) ┐
Email Agent (1.8s)    ├─→ Max: 3.2 seconds
Research Agent (3.2s) ┘
Total: 3.2 seconds (50% faster)
```

### 3. Better Data Quality & Accuracy

- **Claude Sonnet 4.5**: Superior extraction and understanding of unstructured data
- **Context Awareness**: Automatic compaction maintains full thread history for extraction
- **Verification Loop**: PostToolUse hooks ensure data integrity before writes
- **Criteria Validation**: Custom tools prevent workflows from executing with incomplete data

### 4. Flexible Tool Selection

**Current Approach:**
```python
# Rigid workflow - must decide all steps upfront
workflow = {
    "steps": [
        {"action": "extract_data", "tools": ["custom_extractor"]},
        {"action": "validate", "tools": ["validator"]},
        {"action": "update_crm", "tools": ["HUBSPOT_CREATE_CONTACT"]},
        # Fixed sequence, can't adapt
    ]
}
```

**Claude SDK Approach:**
```python
# Agent dynamically decides based on thread content and workflow type
allowed_tools = [
    "SHOPIFY_*",  # All Shopify tools (from Composio)
    "HUBSPOT_*",  # All HubSpot tools (from Composio)
    "GOOGLESHEETS_*",  # All Sheets tools (from Composio)
    "GOOGLECALENDAR_*",  # All Calendar tools (from Composio)
    "create_shopify_discount_code",  # Custom tool (direct or MCP)
    "Read", "Write"  # File operations
]
# Agent picks what's needed for THIS specific workflow instance
# Claude extracts data natively - no custom extraction tools needed
```

**Benefit**: Handles variations in business processes (different contract types, varying order requirements, irregular meeting schedules) without pre-programming every scenario.

### 5. Autonomous Iteration

**Current Approach:**
- Max iterations hardcoded per workflow
- Must validate after each step
- Can't adapt to unexpected results or missing data

**Claude SDK Approach:**
- Configurable max_turns (e.g., 25 for complex workflows)
- Agent iterates until workflow complete
- Self-corrects based on tool results and validation
- Hooks provide safety rails for business logic

**Example**: If contract criteria not met, agent automatically:
1. Analyzes thread and identifies missing information (e.g., payment terms not discussed)
2. Stops workflow and reports what's needed
3. In future runs, validates criteria before proceeding with Write tool

**Example 2**: If Shopify customer not found:
1. Uses SHOPIFY_GET_CUSTOMER to search by email
2. If not found, uses Shopify tools to create new customer record
3. Proceeds with discount code generation using custom GraphQL wrapper
4. Creates draft order with SHOPIFY_CREATE_DRAFT_ORDER

### 6. Production-Ready Error Handling

**Hooks provide deterministic safety for business operations:**

```python
# Prevent Shopify orders exceeding limits
@hook PreToolUse(SHOPIFY_CREATE_DRAFT_ORDER)
def validate_order_limit(ctx):
    total = calculate_order_total(ctx.tool_input)
    if total > 10000:
        return {"deny": True, "reason": "Order exceeds $10k limit - requires approval"}

# Prevent duplicate CRM contacts
@hook PreToolUse(HUBSPOT_CREATE_CONTACT)
def prevent_duplicate_contact(ctx):
    email = ctx.tool_input.get('properties', {}).get('email')
    if contact_exists(email):
        return {"deny": True, "reason": "Contact exists - use UPDATE instead"}

# Validate Google Sheets write has data
@hook PreToolUse(GOOGLESHEETS_APPEND_VALUES)
def ensure_data_present(ctx):
    values = ctx.tool_input.get('values', [])
    if not values or len(values) == 0:
        return {"deny": True, "reason": "Cannot append empty data to spreadsheet"}

# Ensure spreadsheet data written
@hook PostToolUse(GOOGLESHEETS_APPEND_VALUES)
def validate_sheet_write(ctx):
    if ctx.tool_output.get('updatedRows', 0) == 0:
        return {"retry": True, "reason": "No rows written - retrying"}
```

### 7. Observability

**Built-in Monitoring:**
- Every tool call tracked
- Token usage per execution
- Latency breakdown
- Error rates
- Success/failure metrics

**Integration with Existing Stack:**
```python
from langfuse import observe

@observe()  # Works seamlessly with Claude SDK
async def process_email_with_claude_sdk(...):
    # Langfuse automatically traces:
    # - Agent iterations
    # - Tool calls
    # - Hooks
    # - Errors
```

## Comparison: Current vs Claude SDK

| Aspect | Current Multi-Phase | Claude SDK |
|--------|---------------------|------------|
| **LLM Calls** | 13 per execution | 3-4 per execution |
| **Cost** | ~$0.24/execution | ~$0.08/execution |
| **Execution Time** | ~6.6 seconds | ~3.2 seconds (parallel) |
| **Code Complexity** | ~600 lines | ~300 lines |
| **Tool Selection** | Rigid planning | Dynamic selection |
| **Error Handling** | Manual try/catch | Hooks + auto-retry |
| **Context Management** | Manual summarization | Automatic compaction |
| **Parallelization** | Not supported | Subagents |
| **Writing Quality** | GPT-4 | Claude Sonnet 4.5 |
| **Irregular Cases** | Breaks on edge cases | Flexible iteration |

## When to Use This Pattern

**✅ Best For:**

- **Downstream email tasks** (drafting, responding, coordinating)
- **Irregular requests** that don't fit fixed workflows
- **Multi-tool orchestration** (100+ tools available)
- **Quality-focused** (email writing quality matters)
- **Cost-sensitive** (67% reduction in LLM calls)
- **Parallel operations** (calendar + email + research simultaneously)
- **Autonomous execution** (agent works until complete)

**⚠️ Consider Alternatives When:**

- **Highly regulated workflows** requiring explicit audit trail of every decision
- **Fixed sequence required** by compliance (must always follow exact steps)
- **Team prefers GPT models** and has optimized prompts for them
- **Current system working well** and not worth migration risk

## Migration Path

### Phase 1: Proof of Concept (Week 1)
- Implement Claude SDK version for **one** email type (meeting requests)
- Run in parallel with current system
- Compare: quality, cost, completion rate

### Phase 2: A/B Testing (Week 2-3)
- 50/50 split: Half emails → Claude SDK, half → current system
- Measure: user satisfaction, error rates, cost
- Collect feedback from team

### Phase 3: Full Migration (Week 4)
- If PoC successful, migrate all email types
- Keep current system as fallback
- Monitor for 2 weeks

### Phase 4: Optimization (Week 5+)
- Add more custom tools
- Fine-tune hooks and validation
- Expand to additional use cases

## Related Patterns

- **[[state-driven-composio-workflow]]**: The multi-phase approach this pattern replaces
- **[[claude-agent-sdk]]**: Full documentation of Claude Agent SDK capabilities
- **[[composio]]**: Tool integration platform used for Gmail, Calendar, etc.
- **[[model-context-protocol]]**: Protocol enabling custom tool integration
- **[[multi-tool-agent]]**: Alternative multi-tool coordination patterns

## Resources

**Implementation:**
- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)
- [Composio Integration Guide](https://docs.composio.dev/)
- [MCP In-Process Servers](https://docs.claude.com/en/api/agent-sdk/python#custom-tools)

**Examples:**
- [LinkedIn Code Review Agents](https://www.anthropic.com/customers/linkedin) - Production usage
- [Uber Support Automation](https://www.anthropic.com/customers/uber) - Customer support
- [Claude Agent Projects](https://github.com/kingabzpro/claude-agent-projects) - Tutorials

---

## Changelog

- **2025-10-10**: Initial example created showing Claude Agent SDK + Composio integration for business automation
  - **Custom tools work just like Composio**: Pass directly via `tools` parameter - no MCP required!
  - Two options demonstrated: **Direct tool definition** (simpler) and **MCP server** (reusable)
  - Claude's native analysis handles data extraction from threads
  - Fully relies on Composio's 250+ authenticated tools for integrations
  - Demonstrates hooks, subagents, parallel processing, and tool whitelisting
