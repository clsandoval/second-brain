# Business Automation with OpenAI Agent SDK and Composio

**Technologies:**
- **OpenAI Agent SDK**: Autonomous agent framework with built-in loop, function calling, and handoffs (similar to Claude Agent SDK)
- **Composio**: Tool integration platform providing 250+ authenticated tools (Shopify, HubSpot, Google Sheets, Calendar, etc.)

---

## Overview

This example demonstrates a **production-ready business automation system** using:

1. **OpenAI Agent SDK** (`openai-agents-python`) - Autonomous agent framework with built-in execution loop
2. **Composio** - 250+ pre-built, authenticated tools for business applications
3. **Minimal Custom Tools** - Single Shopify discount wrapper using GraphQL

The system processes email threads by:
- Classifying which workflows apply (LLM-based classifier)
- Executing workflows with tool whitelisting security
- Running autonomous agents that orchestrate multiple tools

**Key Architecture Decision**: This uses the NEW [OpenAI Agent SDK](https://openai.github.io/openai-agents-python/) which has built-in autonomous loops similar to Claude Agent SDK - NOT the older Assistants API that requires manual polling.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ 1. Workflow Classifier (LLM)                            │
│    → Analyzes email thread                              │
│    → Returns: ["high_value_prospect", "discount_req"]   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. For Each Workflow:                                   │
│    ┌──────────────────────────────────────────────┐    │
│    │  Workflow Config (Tool Whitelist)            │    │
│    │  high_value_prospect:                        │    │
│    │    allowed_tools:                            │    │
│    │      - HUBSPOT_CREATE_CONTACT                │    │
│    │      - HUBSPOT_UPDATE_DEAL                   │    │
│    │      - GOOGLESHEETS_APPEND_ROW               │    │
│    └──────────────────────────────────────────────┘    │
│                       ↓                                  │
│    ┌──────────────────────────────────────────────┐    │
│    │           OpenAI Agent SDK (Agent)           │    │
│    │  functions: [HUBSPOT_*, GOOGLESHEETS_*,      │    │
│    │              SHOPIFY_*, custom_functions]    │    │
│    │  → Agent figures out EVERYTHING:             │    │
│    │    - Which tools to call                     │    │
│    │    - What parameters to use                  │    │
│    │    - Execution order                         │    │
│    │  ┌────────────────────────────────────┐     │    │
│    │  │  Automatic Loop (Built-in)         │     │    │
│    │  │  ↓ Agent decides next action       │     │    │
│    │  │  ↓ Call function                   │     │    │
│    │  │  ↓ Process result                  │     │    │
│    │  │  ↓ Repeat until done               │     │    │
│    │  └────────────────────────────────────┘     │    │
│    └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Results Aggregation                                  │
│    → Combine all workflow results                       │
│    → Return to user                                     │
└─────────────────────────────────────────────────────────┘
```

**Key Insight**: The OpenAI Agent SDK handles the autonomous loop automatically. You don't poll for completion - the agent runs until it decides the task is complete.

---

## Section 1: Composio Tools (250+ Pre-built Tools)

Composio provides authenticated, production-ready tools for:

- **CRM**: HubSpot, Salesforce
- **E-commerce**: Shopify, WooCommerce
- **Spreadsheets**: Google Sheets, Airtable
- **Calendar**: Google Calendar, Outlook
- **Communication**: Slack, Gmail, Discord
- **And 240+ more...**

**Why Composio?**
- ✅ Authentication handled automatically
- ✅ Rate limiting and retries built-in
- ✅ Standardized tool interface
- ✅ OAuth flows managed for you
- ✅ Multi-user support (user_id parameter)

---

## Section 2: Custom Tool (Shopify Discount Wrapper)

We define ONE custom tool: a wrapper around Shopify's GraphQL API for discount codes.

### Option A: Direct Tool Definition (No MCP Required)

Custom tools can be passed directly to OpenAI Agent SDK just like Composio tools!

```python
# Define tool in OpenAI function format
def create_shopify_discount_code_function():
    return {
        "name": "create_shopify_discount_code",
        "description": "Create a Shopify discount code using GraphQL with automatic code generation",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Discount code title"
                },
                "discount_type": {
                    "type": "string",
                    "enum": ["PERCENTAGE", "FIXED_AMOUNT"],
                    "description": "Type of discount"
                },
                "value": {
                    "type": "number",
                    "description": "Discount value (percentage or fixed amount)"
                },
                "customer_email": {
                    "type": "string",
                    "description": "Customer email to associate discount with"
                }
            },
            "required": ["title", "discount_type", "value", "customer_email"]
        }
    }

# Tool executor
async def execute_create_shopify_discount_code(args: dict) -> dict:
    """
    Executes Shopify GraphQL mutation for discount code creation.
    """
    # Step 1: Generate unique discount code
    code = f"WELCOME{random.randint(1000, 9999)}"

    # Step 2: Build GraphQL mutation
    mutation = """
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
    """

    variables = {
        "basicCodeDiscount": {
            "title": args["title"],
            "code": code,
            "startsAt": datetime.now().isoformat(),
            "customerSelection": {
                "customers": {
                    "add": [args["customer_email"]]
                }
            },
            "customerGets": {
                "value": {
                    "percentage": args["value"] / 100 if args["discount_type"] == "PERCENTAGE"
                    else None,
                    "discountAmount": {
                        "amount": args["value"],
                        "appliesOnEachItem": False
                    } if args["discount_type"] == "FIXED_AMOUNT" else None
                },
                "items": {
                    "all": True
                }
            }
        }
    }

    # Step 3: Execute via Composio's Shopify GraphQL tool
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    result = composio.execute_tool(
        tool_name="SHOPIFY_GRAPHQL_QUERY",
        params={"query": mutation, "variables": variables},
        user_id="user@example.com"
    )

    return {
        "discount_code": code,
        "status": "created",
        "result": result
    }

# Usage with OpenAI Agent SDK
custom_functions = [create_shopify_discount_code_function()]

CUSTOM_FUNCTION_EXECUTORS = {
    "create_shopify_discount_code": execute_create_shopify_discount_code
}
```

**Key Points**:
- ✅ Custom tools use OpenAI's function calling format
- ✅ Pass directly via `functions` parameter
- ✅ Execute via custom handler
- ✅ Mix with Composio tools seamlessly

### Option B: MCP Server (For Reusability)

If you want to reuse custom tools across projects, use MCP:

```python
# mcp_servers/shopify_discount/server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Shopify Discount Tools")

@mcp.tool()
async def create_shopify_discount_code(
    title: str,
    discount_type: str,
    value: float,
    customer_email: str
) -> dict:
    """Create a Shopify discount code using GraphQL."""
    # Same implementation as above
    pass

# Connect MCP to OpenAI Agent SDK
from mcp import ClientSession
from mcp.client.stdio import stdio_client

async def get_mcp_tools():
    async with stdio_client("python", "mcp_servers/shopify_discount/server.py") as (read, write):
        async with ClientSession(read, write) as session:
            tools = await session.list_tools()
            return convert_mcp_to_openai_format(tools)
```

---

## Section 3: Composio + OpenAI Agent SDK Integration

### How It Works

```python
from openai import Agent
from composio import Composio
import os

# Step 1: Get Composio tools in OpenAI format
composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
composio_tools = composio.tools.get(
    toolkits=["shopify", "hubspot", "googlesheets"],
    user_id="user@example.com",
    as_tools="openai"  # ✅ Return in OpenAI function format!
)

# Step 2: Define custom functions
custom_functions = [create_shopify_discount_code_function()]

# Step 3: Create function handler
def handle_function_call(function_name: str, arguments: dict):
    """
    Routes function calls to appropriate executors.
    """
    if function_name in CUSTOM_FUNCTION_EXECUTORS:
        # Execute custom function
        return CUSTOM_FUNCTION_EXECUTORS[function_name](arguments)
    else:
        # Execute Composio tool
        return composio.execute_tool(
            tool_name=function_name,
            params=arguments,
            user_id="user@example.com"
        )

# Step 4: Create OpenAI Agent with all tools
agent = Agent(
    name="Business Automation Agent",
    instructions="""You are a business automation assistant. You have access to:
    - HubSpot (CRM operations)
    - Google Sheets (data tracking)
    - Shopify (e-commerce operations)
    - Custom discount code creation

    Use these tools to automate business workflows based on email threads.""",
    model="gpt-4-turbo-preview",
    functions=composio_tools + custom_functions,  # ✅ Mix Composio + custom!
    function_handler=handle_function_call
)

# Step 5: Run agent (automatic loop - no polling needed!)
result = agent.run("Process this email thread: [email content...]")
print(result)
```

**Key Differences from Claude Agent SDK**:

| Aspect | OpenAI Agent SDK | Claude Agent SDK |
|--------|------------------|------------------|
| Import | `from openai import Agent` | `from claude_agent_sdk import ClaudeSDKClient` |
| Tools parameter | `functions` | `tools` |
| Execution handler | `function_handler` | `tool_executors` |
| Tool format | OpenAI function schema | Anthropic tool schema |
| Composio format | `as_tools="openai"` | `as_tools="anthropic"` |
| Async support | Built-in | Built-in |
| Automatic loop | ✅ Yes | ✅ Yes |
| Manual polling | ❌ No | ❌ No |

**Both SDKs**:
- ✅ Have built-in autonomous loops
- ✅ Handle tool orchestration automatically
- ✅ Support seamless Composio integration
- ✅ Mix custom + Composio tools easily

---

## Section 4: Workflow Configuration

Each workflow defines:
1. **Name**: Workflow identifier
2. **Description**: What this workflow does
3. **Allowed Tools**: Whitelist of tools agent can use (security layer)
4. **Instructions**: Detailed agent instructions

```python
WORKFLOWS = {
    "high_value_prospect": {
        "description": "Process high-value prospect inquiries",
        "allowed_tools": [
            "HUBSPOT_CREATE_CONTACT",
            "HUBSPOT_UPDATE_DEAL",
            "HUBSPOT_CREATE_DEAL",
            "GOOGLESHEETS_APPEND_ROW"
        ],
        "instructions": """
        You are processing a high-value prospect inquiry. Your tasks:

        1. Extract prospect information (name, email, company, role)
        2. Create/update HubSpot contact
        3. Create deal in HubSpot pipeline (stage: "Qualified")
        4. Log to Google Sheets tracking spreadsheet

        Return summary of actions taken.
        """
    },

    "discount_request": {
        "description": "Handle customer discount requests",
        "allowed_tools": [
            "HUBSPOT_GET_CONTACT",
            "create_shopify_discount_code",  # ✅ Custom function
            "GMAIL_SEND_EMAIL"
        ],
        "instructions": """
        You are processing a discount request. Your tasks:

        1. Look up customer in HubSpot by email
        2. Determine discount eligibility (check: lifetime_value >= $500)
        3. If eligible:
           - Create 15% discount code using create_shopify_discount_code
           - Send discount code via Gmail
        4. If not eligible:
           - Send polite decline via Gmail

        Return summary of actions taken.
        """
    },

    "meeting_scheduling": {
        "description": "Schedule meetings with prospects/customers",
        "allowed_tools": [
            "GOOGLECALENDAR_CREATE_EVENT",
            "GMAIL_SEND_EMAIL",
            "HUBSPOT_UPDATE_CONTACT"
        ],
        "instructions": """
        You are scheduling a meeting. Your tasks:

        1. Extract meeting details (date, time, attendees, topic)
        2. Create Google Calendar event
        3. Send confirmation email via Gmail
        4. Update HubSpot contact with meeting notes

        Return summary of actions taken.
        """
    }
}
```

**Security Note**: Tool whitelisting prevents agents from accessing unauthorized tools (e.g., discount workflow can't modify calendar).

---

## Section 5: Workflow Classifier

The classifier determines which workflows apply to an email thread using an LLM.

```python
from openai import OpenAI
import json

def classify_workflows(email_thread: str) -> list[str]:
    """
    Uses OpenAI to classify which workflows should be triggered.

    Returns list of workflow names, e.g., ["high_value_prospect", "discount_request"]
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    workflow_descriptions = {
        name: config["description"]
        for name, config in WORKFLOWS.items()
    }

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": f"""You are a workflow classifier. Given an email thread, determine which workflows should be triggered.

Available workflows:
{json.dumps(workflow_descriptions, indent=2)}

Return ONLY a JSON array of workflow names, e.g., ["high_value_prospect", "discount_request"].
Return empty array [] if no workflows apply."""
            },
            {
                "role": "user",
                "content": f"Email thread:\n\n{email_thread}"
            }
        ],
        temperature=0
    )

    try:
        workflows = json.loads(response.choices[0].message.content)
        return workflows
    except json.JSONDecodeError:
        return []
```

**Example Classification**:

Input:
```
From: john@bigcorp.com
Subject: Enterprise Plan Inquiry + Discount Request

Hi, I'm the CTO at BigCorp (5000 employees). We're interested in your
enterprise plan for our entire engineering team (500 seats).

Is there any discount available for bulk purchase?

Best,
John
```

Output:
```python
["high_value_prospect", "discount_request"]
```

Both workflows will be executed in parallel.

---

## Section 6: Main Orchestration

```python
from openai import Agent
from composio import Composio
import asyncio
import os

# Initialize Composio
composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

async def run_workflow(
    workflow_name: str,
    email_thread: str,
    user_id: str
) -> dict:
    """
    Executes a single workflow using OpenAI Agent SDK.
    """
    workflow = WORKFLOWS[workflow_name]

    # Step 1: Get Composio tools (filtered by whitelist)
    composio_tools = composio.tools.get(
        toolkits=["shopify", "hubspot", "googlesheets", "gmail", "googlecalendar"],
        user_id=user_id,
        as_tools="openai"
    )

    # Step 2: Filter to allowed tools only
    allowed_tool_names = set(workflow["allowed_tools"])
    filtered_composio_tools = [
        tool for tool in composio_tools
        if tool["name"] in allowed_tool_names
    ]

    # Step 3: Add custom functions if whitelisted
    custom_functions = []
    if "create_shopify_discount_code" in allowed_tool_names:
        custom_functions.append(create_shopify_discount_code_function())

    all_functions = filtered_composio_tools + custom_functions

    # Step 4: Create function handler
    def handle_function_call(function_name: str, arguments: dict):
        if function_name in CUSTOM_FUNCTION_EXECUTORS:
            return CUSTOM_FUNCTION_EXECUTORS[function_name](arguments)
        else:
            return composio.execute_tool(
                tool_name=function_name,
                params=arguments,
                user_id=user_id
            )

    # Step 5: Create OpenAI Agent
    agent = Agent(
        name=f"{workflow_name.replace('_', ' ').title()} Agent",
        instructions=f"""{workflow["instructions"]}

Email thread to process:
{email_thread}""",
        model="gpt-4-turbo-preview",
        functions=all_functions,
        function_handler=handle_function_call
    )

    # Step 6: Run agent (automatic loop!)
    try:
        result = agent.run(email_thread)
        return {
            "workflow": workflow_name,
            "status": "success",
            "result": result
        }
    except Exception as e:
        return {
            "workflow": workflow_name,
            "status": "error",
            "error": str(e)
        }

async def process_email_thread(email_thread: str, user_id: str = "user@example.com") -> dict:
    """
    Main orchestration function.

    1. Classify workflows
    2. Execute workflows in parallel
    3. Return aggregated results
    """
    # Step 1: Classify workflows
    workflows_to_run = classify_workflows(email_thread)

    if not workflows_to_run:
        return {
            "status": "no_workflows",
            "message": "No workflows matched this email thread"
        }

    # Step 2: Execute workflows in parallel
    tasks = [
        run_workflow(workflow_name, email_thread, user_id)
        for workflow_name in workflows_to_run
    ]
    results = await asyncio.gather(*tasks)

    # Step 3: Return aggregated results
    return {
        "status": "completed",
        "workflows_executed": workflows_to_run,
        "results": results
    }

# Usage
async def main():
    email = """
    From: john@bigcorp.com
    Subject: Enterprise Plan + Discount

    Hi, I'm the CTO at BigCorp. Interested in enterprise plan for 500 seats.
    Any bulk discount available?
    """

    result = await process_email_thread(email)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Section 7: Complete Code

```python
"""
Business Automation with OpenAI Agent SDK + Composio
Processes email threads using autonomous agents with 250+ tools
"""

from openai import Agent, OpenAI
from composio import Composio
import asyncio
import os
import json
import random
from datetime import datetime

# ============================================================================
# CUSTOM TOOLS
# ============================================================================

def create_shopify_discount_code_function():
    """Define Shopify discount code creation function."""
    return {
        "name": "create_shopify_discount_code",
        "description": "Create a Shopify discount code using GraphQL with automatic code generation",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Discount code title"},
                "discount_type": {
                    "type": "string",
                    "enum": ["PERCENTAGE", "FIXED_AMOUNT"],
                    "description": "Type of discount"
                },
                "value": {"type": "number", "description": "Discount value"},
                "customer_email": {"type": "string", "description": "Customer email"}
            },
            "required": ["title", "discount_type", "value", "customer_email"]
        }
    }

async def execute_create_shopify_discount_code(args: dict) -> dict:
    """Execute Shopify discount code creation."""
    code = f"WELCOME{random.randint(1000, 9999)}"

    mutation = """
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
    """

    variables = {
        "basicCodeDiscount": {
            "title": args["title"],
            "code": code,
            "startsAt": datetime.now().isoformat(),
            "customerSelection": {
                "customers": {"add": [args["customer_email"]]}
            },
            "customerGets": {
                "value": {
                    "percentage": args["value"] / 100 if args["discount_type"] == "PERCENTAGE" else None,
                    "discountAmount": {
                        "amount": args["value"],
                        "appliesOnEachItem": False
                    } if args["discount_type"] == "FIXED_AMOUNT" else None
                },
                "items": {"all": True}
            }
        }
    }

    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    result = composio.execute_tool(
        tool_name="SHOPIFY_GRAPHQL_QUERY",
        params={"query": mutation, "variables": variables},
        user_id="user@example.com"
    )

    return {"discount_code": code, "status": "created", "result": result}

CUSTOM_FUNCTION_EXECUTORS = {
    "create_shopify_discount_code": execute_create_shopify_discount_code
}

# ============================================================================
# WORKFLOW CONFIGURATIONS
# ============================================================================

WORKFLOWS = {
    "high_value_prospect": {
        "description": "Process high-value prospect inquiries",
        "allowed_tools": [
            "HUBSPOT_CREATE_CONTACT",
            "HUBSPOT_UPDATE_DEAL",
            "HUBSPOT_CREATE_DEAL",
            "GOOGLESHEETS_APPEND_ROW"
        ],
        "instructions": """
        You are processing a high-value prospect inquiry. Your tasks:

        1. Extract prospect information (name, email, company, role)
        2. Create/update HubSpot contact
        3. Create deal in HubSpot pipeline (stage: "Qualified")
        4. Log to Google Sheets tracking spreadsheet

        Return summary of actions taken.
        """
    },

    "discount_request": {
        "description": "Handle customer discount requests",
        "allowed_tools": [
            "HUBSPOT_GET_CONTACT",
            "create_shopify_discount_code",
            "GMAIL_SEND_EMAIL"
        ],
        "instructions": """
        You are processing a discount request. Your tasks:

        1. Look up customer in HubSpot by email
        2. Determine discount eligibility (check: lifetime_value >= $500)
        3. If eligible:
           - Create 15% discount code using create_shopify_discount_code
           - Send discount code via Gmail
        4. If not eligible:
           - Send polite decline via Gmail

        Return summary of actions taken.
        """
    },

    "meeting_scheduling": {
        "description": "Schedule meetings with prospects/customers",
        "allowed_tools": [
            "GOOGLECALENDAR_CREATE_EVENT",
            "GMAIL_SEND_EMAIL",
            "HUBSPOT_UPDATE_CONTACT"
        ],
        "instructions": """
        You are scheduling a meeting. Your tasks:

        1. Extract meeting details (date, time, attendees, topic)
        2. Create Google Calendar event
        3. Send confirmation email via Gmail
        4. Update HubSpot contact with meeting notes

        Return summary of actions taken.
        """
    }
}

# ============================================================================
# WORKFLOW CLASSIFIER
# ============================================================================

def classify_workflows(email_thread: str) -> list[str]:
    """Use OpenAI to classify which workflows should be triggered."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    workflow_descriptions = {
        name: config["description"]
        for name, config in WORKFLOWS.items()
    }

    response = client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[
            {
                "role": "system",
                "content": f"""You are a workflow classifier. Given an email thread, determine which workflows should be triggered.

Available workflows:
{json.dumps(workflow_descriptions, indent=2)}

Return ONLY a JSON array of workflow names, e.g., ["high_value_prospect", "discount_request"].
Return empty array [] if no workflows apply."""
            },
            {
                "role": "user",
                "content": f"Email thread:\n\n{email_thread}"
            }
        ],
        temperature=0
    )

    try:
        workflows = json.loads(response.choices[0].message.content)
        return workflows
    except json.JSONDecodeError:
        return []

# ============================================================================
# WORKFLOW EXECUTION
# ============================================================================

async def run_workflow(
    workflow_name: str,
    email_thread: str,
    user_id: str
) -> dict:
    """Execute a single workflow using OpenAI Agent SDK."""
    workflow = WORKFLOWS[workflow_name]

    # Get Composio tools
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    composio_tools = composio.tools.get(
        toolkits=["shopify", "hubspot", "googlesheets", "gmail", "googlecalendar"],
        user_id=user_id,
        as_tools="openai"
    )

    # Filter to allowed tools
    allowed_tool_names = set(workflow["allowed_tools"])
    filtered_composio_tools = [
        tool for tool in composio_tools
        if tool["name"] in allowed_tool_names
    ]

    # Add custom functions if whitelisted
    custom_functions = []
    if "create_shopify_discount_code" in allowed_tool_names:
        custom_functions.append(create_shopify_discount_code_function())

    all_functions = filtered_composio_tools + custom_functions

    # Create function handler
    def handle_function_call(function_name: str, arguments: dict):
        if function_name in CUSTOM_FUNCTION_EXECUTORS:
            return CUSTOM_FUNCTION_EXECUTORS[function_name](arguments)
        else:
            return composio.execute_tool(
                tool_name=function_name,
                params=arguments,
                user_id=user_id
            )

    # Create and run agent
    agent = Agent(
        name=f"{workflow_name.replace('_', ' ').title()} Agent",
        instructions=f"""{workflow["instructions"]}

Email thread to process:
{email_thread}""",
        model="gpt-4-turbo-preview",
        functions=all_functions,
        function_handler=handle_function_call
    )

    try:
        result = agent.run(email_thread)
        return {
            "workflow": workflow_name,
            "status": "success",
            "result": result
        }
    except Exception as e:
        return {
            "workflow": workflow_name,
            "status": "error",
            "error": str(e)
        }

# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

async def process_email_thread(email_thread: str, user_id: str = "user@example.com") -> dict:
    """
    Main orchestration function.

    1. Classify workflows
    2. Execute workflows in parallel
    3. Return aggregated results
    """
    # Classify workflows
    workflows_to_run = classify_workflows(email_thread)

    if not workflows_to_run:
        return {
            "status": "no_workflows",
            "message": "No workflows matched this email thread"
        }

    # Execute workflows in parallel
    tasks = [
        run_workflow(workflow_name, email_thread, user_id)
        for workflow_name in workflows_to_run
    ]
    results = await asyncio.gather(*tasks)

    return {
        "status": "completed",
        "workflows_executed": workflows_to_run,
        "results": results
    }

# ============================================================================
# USAGE EXAMPLE
# ============================================================================

async def main():
    """Example usage."""
    email = """
    From: john@bigcorp.com
    Subject: Enterprise Plan Inquiry + Discount Request

    Hi, I'm the CTO at BigCorp (5000 employees). We're interested in your
    enterprise plan for our entire engineering team (500 seats).

    Is there any discount available for bulk purchase?

    Also, would love to schedule a demo next week. Available Tuesday/Wednesday.

    Best,
    John Smith
    john@bigcorp.com
    """

    result = await process_email_thread(email)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Section 8: Key Takeaways

### 1. OpenAI Agent SDK vs Assistants API

**OpenAI Agent SDK (This Example)**:
```python
from openai import Agent

agent = Agent(functions=tools, function_handler=handler)
result = agent.run(query)  # ✅ Automatic loop, returns when done
```

**Assistants API (Old Approach)**:
```python
from openai import AsyncOpenAI

client = AsyncOpenAI()
assistant = await client.beta.assistants.create(tools=tools)
thread = await client.beta.threads.create()
run = await client.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant.id)

# ❌ Manual polling required
while run.status != "completed":
    run = await client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
    await asyncio.sleep(1)
```

**Use Agent SDK, not Assistants API** for autonomous agents!

### 2. Composio Integration is Seamless

```python
# Step 1: Get tools
composio_tools = composio.tools.get(
    toolkits=["shopify", "hubspot"],
    as_tools="openai"
)

# Step 2: Pass to agent
agent = Agent(functions=composio_tools)

# That's it! ✅
```

### 3. Custom Tools Work Just Like Composio Tools

```python
# Define custom function
custom_function = {
    "name": "my_custom_tool",
    "parameters": {...}
}

# Mix with Composio tools
agent = Agent(
    functions=composio_tools + [custom_function],
    function_handler=handle_all_functions
)
```

No MCP required unless you want reusability across projects!

### 4. Tool Whitelisting is Critical for Security

```python
# Only allow specific tools per workflow
workflow["allowed_tools"] = [
    "HUBSPOT_CREATE_CONTACT",  # ✅ Allowed
    "SHOPIFY_DELETE_PRODUCT"   # ❌ Not in list
]
```

Prevents agents from accessing unauthorized tools.

### 5. Autonomous Loops Handle Everything

The OpenAI Agent SDK automatically:
- Decides which tools to call
- Determines parameter values
- Handles execution order
- Retries on failures
- Continues until task complete

You just call `agent.run(query)` and get the result!

---

## Section 9: Production Considerations

### Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
COMPOSIO_API_KEY=ck_...

# Composio will prompt for OAuth during setup:
composio add shopify
composio add hubspot
composio add googlesheets
```

### Error Handling

```python
try:
    result = agent.run(query)
except Exception as e:
    # Agent SDK provides detailed error context
    print(f"Agent failed: {e}")
    # Implement retry logic, fallback workflows, etc.
```

### Monitoring

```python
# Log all tool calls for debugging
def handle_function_call(function_name: str, arguments: dict):
    print(f"[TOOL CALL] {function_name}({arguments})")
    result = execute_tool(function_name, arguments)
    print(f"[TOOL RESULT] {result}")
    return result
```

### Rate Limiting

Composio handles rate limiting automatically, but you can add additional controls:

```python
import asyncio
from asyncio import Semaphore

semaphore = Semaphore(5)  # Max 5 concurrent workflows

async def run_workflow_with_limit(workflow_name, email_thread, user_id):
    async with semaphore:
        return await run_workflow(workflow_name, email_thread, user_id)
```

---

## Comparison: OpenAI Agent SDK vs Claude Agent SDK

| Feature | OpenAI Agent SDK | Claude Agent SDK |
|---------|------------------|------------------|
| **Import** | `from openai import Agent` | `from claude_agent_sdk import ClaudeSDKClient` |
| **Tools Parameter** | `functions` | `tools` |
| **Execution Handler** | `function_handler` | `tool_executors` |
| **Tool Schema** | OpenAI function format | Anthropic tool format |
| **Composio Format** | `as_tools="openai"` | `as_tools="anthropic"` |
| **Autonomous Loop** | ✅ Built-in | ✅ Built-in |
| **Manual Polling** | ❌ Not required | ❌ Not required |
| **Async Support** | ✅ Yes | ✅ Yes |
| **Handoffs** | ✅ Supported | ✅ Supported |
| **Streaming** | ✅ Yes | ✅ Yes |
| **Custom Tools** | ✅ Direct passing | ✅ Direct passing |
| **MCP Support** | ✅ Yes (optional) | ✅ Yes (optional) |

**Both SDKs provide the same core functionality**: autonomous agents with built-in loops, seamless Composio integration, and flexible custom tool support!

---

## Resources

- **OpenAI Agent SDK**: https://openai.github.io/openai-agents-python/
- **Composio**: https://docs.composio.dev
- **Composio Tool Catalog**: https://app.composio.dev/tools
- **OpenAI Function Calling**: https://platform.openai.com/docs/guides/function-calling
- **MCP Protocol**: https://modelcontextprotocol.io
