---
title: Business Automation with OpenAI Agent SDK and Composio
type: example
tags: [agent, openai, openai-agents, composio, automation, function-calling, tool-orchestration, shopify, hubspot, contracts, spreadsheets, calendar]
created: 2025-10-10
updated: 2025-10-10
---

# Business Automation with OpenAI Agent SDK and Composio

## Overview

This example demonstrates building autonomous business process automation agents using OpenAI's Agent SDK (openai-agents-python) integrated with [[composio]] tools. The pattern replaces rigid multi-phase orchestration with OpenAI's agent loop, enabling dynamic tool selection, parallel processing, and intelligent iteration.

**Key Innovation**: Combining OpenAI Agent SDK's autonomous agent capabilities with Composio's 250+ authenticated tools to create business automation workflows that handle irregular, criteria-driven tasks better than fixed workflow approaches. GPT-4's native analysis handles data extraction.

**Use Cases**:
- **Spreadsheet Updates**: Monitor email threads and update Google Sheets with extracted data
- **Contract Generation**: Generate contracts when specific criteria are met in email threads
- **E-commerce Operations**: Create Shopify discount codes and draft orders based on thread criteria
- **Calendar Management**: Check schedules, send invites, coordinate meetings
- **CRM Updates**: Automatically update HubSpot based on email interactions

**Technologies:**
- **OpenAI Agent SDK**: Autonomous agent framework with built-in loop, function calling, handoffs (similar to Claude Agent SDK)
- **[[composio]]**: Tool integration platform providing authenticated access to Shopify, HubSpot, Google Sheets, Calendar, etc.
- **Custom Functions**: Pass directly like Composio tools - seamless integration
- **Python asyncio**: Async execution for workflow processing

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

3. **Execute** - let OpenAI Agent SDK handle everything:
   ```python
   result = await run_workflows(thread, context, settings)
   # GPT-4 figures out: tool orchestration, parallel execution,
   # error handling, when to stop - EVERYTHING
   ```

That's it! No `if workflow_type == "contract"` logic. No hardcoded orchestration. OpenAI Agent SDK does it all.

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
│  & Build Instructions   │  ← Combine workflow prompts
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│           OpenAI Agent SDK (Agent)                      │
│                                                         │
│  instructions: "Execute: contract_generation,           │
│                 crm_update. Work autonomously."         │
│                                                         │
│  functions: [HUBSPOT_*, GOOGLESHEETS_*, SHOPIFY_*,     │
│              create_shopify_discount_code, ...]        │
│                                                         │
│  → Agent figures out EVERYTHING:                        │
│    - Which tools to call (via function calling)         │
│    - In what order                                      │
│    - Parallel execution                                 │
│    - Error handling                                     │
│    - When to stop                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Automatic Loop       │  ← Built-in like Claude SDK
            └───────────────────────┘
                        │
                        ▼
            ┌────────────────────────────────┐
            │  Composio + Custom Functions   │
            │  (Seamless integration)        │
            └────────────────────────────────┘
```

**What you configure:**
1. **Workflow definitions** (`WORKFLOWS` dict) - just prompts + tool whitelists
2. **Custom functions** (optional) - Pass directly as OpenAI functions, works like Composio
3. **Function execution** - Handle tool calls in run loop

**What OpenAI Assistant handles:**
- Tool orchestration, parallel execution, error recovery, iteration
- GPT-4 extracts data from threads using its native analysis capabilities
- Business logic is mostly handled by GPT-4 + Composio tools directly

**Key Insight**: Custom functions work just like Composio tools - define them in OpenAI function format and pass via `tools` parameter.

### Agent Flow

**Traditional Multi-Phase Approach:**
```
Classify → Define State → Plan → Execute → Validate → Summarize → Repeat
  (LLM)      (LLM)        (LLM)    (API)     (LLM)       (LLM)
```
**13 LLM calls per execution**

**OpenAI Assistant Approach:**
```
Initial Message → [Autonomous Assistant Loop] → Final Output
    (LLM)         │                           │
                  ├─ Function Selection (LLM)  │
                  ├─ Function Execution        │
                  ├─ Result Processing         │
                  └─ Context Management        │
                     Repeat until complete     │
```
**3-4 LLM calls per execution (67% reduction)**

## Core Components

### 1. Workflow Configuration

Same as Claude example - workflows are platform-agnostic:

```python
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class WorkflowConfig:
    """Configuration for a business automation workflow"""
    name: str
    description: str  # For classifier
    prompt: str  # Instructions for the assistant
    allowed_tools: List[str]  # Whitelisted tools
    priority: int = 0

# Define all available workflows (same as Claude example)
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
   - Generate contract document
   - Update HubSpot: create/update contact, create deal (stage: Proposal Sent)
   - Log to Google Sheets audit trail
   - If kickoff meeting mentioned, schedule it

Do NOT generate contracts with incomplete information.""",
        allowed_tools=[
            "HUBSPOT_CREATE_CONTACT", "HUBSPOT_UPDATE_CONTACT",
            "HUBSPOT_CREATE_DEAL", "HUBSPOT_UPDATE_DEAL", "HUBSPOT_CREATE_NOTE",
            "HUBSPOT_SEARCH_CONTACTS",
            "GOOGLESHEETS_APPEND_VALUES", "GOOGLESHEETS_GET_VALUES",
            "GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_SEND_INVITE"
        ]
    ),

    "shopify_order": WorkflowConfig(
        name="shopify_order",
        description="Create Shopify discount codes and draft orders when customer requests products with pricing",
        prompt="""Process Shopify order from email thread.

Steps:
1. Extract order details from thread: customer email, products, quantities, pricing
2. Validate customer eligibility for discount (if mentioned)
3. If eligible, use create_shopify_discount_code to generate discount details
4. Create draft order with SHOPIFY_CREATE_DRAFT_ORDER
5. Apply discount if created
6. Log order to tracking spreadsheet
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
            "GOOGLESHEETS_APPEND_VALUES",
            "create_shopify_discount_code"
        ]
    ),

    # ... other workflows (spreadsheet_update, crm_update, calendar_coordination)
}
```

### 2. Custom Functions (Optional)

Custom functions integrate seamlessly with Composio:

```python
import random
import string

# Define custom function in OpenAI format
def create_shopify_discount_code_function():
    """Function definition for OpenAI"""
    return {
        "type": "function",
        "function": {
            "name": "create_shopify_discount_code",
            "description": "Create a Shopify discount code using GraphQL with automatic code generation",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the discount"
                    },
                    "discount_type": {
                        "type": "string",
                        "enum": ["PERCENTAGE", "FIXED_AMOUNT"],
                        "description": "Type of discount"
                    },
                    "value": {
                        "type": "number",
                        "description": "Discount value (percentage or amount)"
                    },
                    "customer_email": {
                        "type": "string",
                        "description": "Customer email address"
                    },
                    "minimum_order_value": {
                        "type": "number",
                        "description": "Minimum order value required"
                    },
                    "usage_limit": {
                        "type": "integer",
                        "description": "Number of times discount can be used"
                    }
                },
                "required": ["title", "discount_type", "value", "customer_email"]
            }
        }
    }

async def execute_create_shopify_discount_code(arguments: dict):
    """Execute the discount code creation logic"""
    title = arguments['title']
    discount_type = arguments['discount_type']
    value = arguments['value']
    customer_email = arguments['customer_email']
    minimum_order = arguments.get('minimum_order_value', 0)
    usage_limit = arguments.get('usage_limit', 1)

    # Generate unique discount code
    code = f"DISCOUNT-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

    # Build GraphQL mutation (simplified)
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
        "status": "success",
        "discount_code": code,
        "graphql_query": graphql_query,
        "graphql_variables": variables,
        "message": f"Discount code {code} created. Use SHOPIFY_GRAPHQL_TOOL to execute the mutation."
    }

# Map function names to executors
CUSTOM_FUNCTION_EXECUTORS = {
    "create_shopify_discount_code": execute_create_shopify_discount_code
}
```

### 3. Composio + OpenAI Integration

**The Integration is Built-In and Seamless:**

```
Composio Tools → OpenAI Assistants API (native support) → Assistant executes
     ↓                        ↓                                    ↓
  Get tools            Pass via tools param            Uses tools autonomously
```

**How it works:**

```python
from openai import AsyncOpenAI
from composio import Composio
import os

# Step 1: Get Composio tools
composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

# Fetch tools in OpenAI format
composio_tools = composio.tools.get(
    toolkits=["shopify", "hubspot", "googlesheets"],
    user_id="user@example.com",  # User's authenticated connections
    as_tools="openai"  # ✅ Return in OpenAI function format!
)

# Step 2: Create OpenAI Assistant
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

assistant = await client.beta.assistants.create(
    name="Business Automation Agent",
    instructions="Your automation instructions...",
    model="gpt-4-turbo-preview",
    tools=composio_tools + custom_functions  # ✅ Mix Composio + custom!
)

# Step 3: Create thread and run
thread = await client.beta.threads.create()
message = await client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Process this email thread..."
)

run = await client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)
```

**Key Points:**

1. **Native Support**: Composio returns tools in OpenAI function format via `as_tools="openai"`
2. **Authentication**: Composio handles OAuth/API key management per user via `user_id`
3. **Tool Discovery**: Assistant sees all Composio tools matching the specified toolkits
4. **Combined Tools**: Mix Composio tools + custom functions seamlessly
5. **Automatic Execution**: OpenAI handles function calling loop automatically

**What happens under the hood:**
- Composio returns tools in [OpenAI function calling format](https://platform.openai.com/docs/guides/function-calling)
- OpenAI Assistant manages function calling loop automatically
- When assistant calls a function, we handle execution in run loop
- Composio executes tools using user's authenticated connection
- Results are submitted back to the run

### 4. Workflow Classifier

Same as Claude example - classifier is platform-agnostic:

```python
from openai import AsyncOpenAI
import json

async def classify_workflows(email_thread: dict, thread_context: dict) -> List[str]:
    """
    Classify which workflows are relevant for this email thread

    Uses a simple GPT-4 call to match thread context to workflow descriptions
    """
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

    response = await client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=[{"role": "user", "content": classification_prompt}],
        max_tokens=200,
        response_format={"type": "json_object"}
    )

    # Parse response
    result = json.loads(response.choices[0].message.content)
    workflow_names = result.get("workflows", [])

    # Filter to valid workflows
    valid_workflows = [name for name in workflow_names if name in WORKFLOWS]

    return valid_workflows
```

### 5. Complete Workflow Execution

Here's the complete implementation showing the OpenAI Assistant run loop:

```python
from openai import AsyncOpenAI
from composio import Composio
from datetime import datetime
import asyncio
import json
import os

async def run_workflows(
    email_thread: dict,
    thread_context: dict,
    user_settings: dict
) -> dict:
    """
    Run business automation workflows using OpenAI Assistant - NO hardcoded logic

    Steps:
    1. Classify which workflows apply to thread
    2. Collect allowed tools from workflows
    3. Create assistant with combined instructions
    4. Let OpenAI Assistant handle everything autonomously
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

    # Build combined workflow instructions
    workflow_instructions = "\n\n---\n\n".join([
        f"**{workflow.name.upper()}**:\n{workflow.prompt}"
        for workflow in selected_workflows
    ])

    # Step 3: Setup custom functions
    custom_functions = []
    if "create_shopify_discount_code" in all_tools:
        custom_functions.append(create_shopify_discount_code_function())

    # Step 4: Fetch Composio tools
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    user_id = user_settings.get("user_id", "")

    # Get all Composio toolkits needed
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

    # Fetch Composio tools in OpenAI format
    if toolkits:
        composio_tools = composio.tools.get(
            toolkits=list(toolkits),
            user_id=user_id,
            as_tools="openai"  # ✅ Return in OpenAI function format
        )
    else:
        composio_tools = []

    # Step 5: Create OpenAI Assistant
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    assistant = await client.beta.assistants.create(
        name="Business Automation Agent",
        instructions=f"""You are an autonomous business process automation agent.

You have been assigned these workflows to execute:
{', '.join([w.name for w in selected_workflows])}

IMPORTANT: Execute ALL assigned workflows. Work on them in parallel when possible.

Your tools and responsibilities:
{workflow_instructions}

Email Thread Context:
- Subject: {email_thread.get('subject', 'N/A')}
- From: {email_thread.get('from', 'N/A')}
- Participants: {', '.join(thread_context.get('participants', []))}

Work autonomously until all workflows are complete. Coordinate actions across systems.""",
        model="gpt-4-turbo-preview",
        tools=composio_tools + custom_functions  # Mix both!
    )

    # Step 6: Create thread and message
    thread = await client.beta.threads.create()

    # Build message with full thread context
    thread_history = "\n\n".join([
        f"[{email.get('date')}] {email.get('from')}:\n{email.get('body', '')}"
        for email in thread_context.get('previous_emails', [])
    ])

    message_content = f"""Process this email thread and execute all assigned workflows.

THREAD HISTORY:
{thread_history}

LATEST MESSAGE:
From: {email_thread.get('from')}
Date: {email_thread.get('date')}
Body:
{email_thread.get('body', '')}

Execute all workflows assigned to you. Work until complete."""

    await client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=message_content
    )

    # Step 7: Create and monitor run
    run = await client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id
    )

    # Step 8: Poll run until completion
    tools_used = []
    iterations = 0

    while run.status in ["queued", "in_progress", "requires_action"]:
        await asyncio.sleep(1)  # Poll every second
        run = await client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )

        iterations += 1

        # Handle function calls
        if run.status == "requires_action":
            tool_outputs = []

            for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                tools_used.append(function_name)

                # Execute custom functions
                if function_name in CUSTOM_FUNCTION_EXECUTORS:
                    result = await CUSTOM_FUNCTION_EXECUTORS[function_name](function_args)
                    output = json.dumps(result)
                else:
                    # Let Composio handle its tools
                    result = composio.execute_tool(
                        tool_name=function_name,
                        params=function_args,
                        user_id=user_id
                    )
                    output = json.dumps(result)

                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": output
                })

            # Submit tool outputs
            run = await client.beta.threads.runs.submit_tool_outputs(
                thread_id=thread.id,
                run_id=run.id,
                tool_outputs=tool_outputs
            )

    # Step 9: Get final response
    messages = await client.beta.threads.messages.list(thread_id=thread.id)
    final_message = messages.data[0].content[0].text.value

    # Cleanup
    await client.beta.assistants.delete(assistant.id)

    duration = (datetime.now() - start_time).total_seconds()

    return {
        "success": run.status == "completed",
        "workflows": workflow_names,
        "output": final_message,
        "tools_used": list(set(tools_used)),
        "iterations": iterations,
        "duration_seconds": duration
    }
```

### 6. Main Execution - Simple!

Just call `run_workflows`:

```python
async def process_business_automation(
    email_thread: dict,
    thread_context: dict,
    user_settings: dict
) -> dict:
    """
    Process business automation - classifier determines workflows, assistant executes

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

### Example: Contract Generation Workflow

```python
import asyncio
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

### Expected Output

```
Success: True
Workflows Executed: contract_generation, crm_update, calendar_coordination
Tools Used: HUBSPOT_SEARCH_CONTACTS, HUBSPOT_CREATE_CONTACT, HUBSPOT_CREATE_DEAL, HUBSPOT_CREATE_NOTE, GOOGLESHEETS_APPEND_VALUES, GOOGLECALENDAR_CREATE_EVENT, GOOGLECALENDAR_SEND_INVITE
Iterations: 9
Duration: 4.2s

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
- Contract document created

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
- Spreadsheet audit log updated

CALENDAR COORDINATION:
✅ Kickoff Meeting Scheduled
- Event: "Project Kickoff - Acme Corp Website Redesign"
- Date: Monday, Nov 4, 2025 at 2:00 PM EST
- Duration: 60 minutes
- Attendees: sarah.johnson@acmecorp.com, team@yourcompany.com
- Google Meet link generated
- Invites sent to all participants

All workflows completed successfully.
```

## Comparison: Claude Agent SDK vs OpenAI Assistants API

| Aspect | Claude Agent SDK | OpenAI Assistants API |
|--------|------------------|------------------------|
| **Model** | Claude Sonnet 4.5 | GPT-4 Turbo |
| **Tool Format** | Anthropic format | OpenAI function format |
| **Composio Support** | Native (`tools` param) | Native (`as_tools="openai"`) |
| **Custom Tools** | Direct + MCP | Direct functions |
| **Run Loop** | Automatic | Manual polling required |
| **Hooks** | Built-in hooks system | Manual validation in loop |
| **Context Management** | Automatic compaction | Thread-based |
| **Cost per 1K tokens** | ~$3 input / ~$15 output | ~$10 input / ~$30 output |
| **Execution Speed** | ~3.8s typical | ~4.2s typical |
| **Parallel Functions** | Automatic | Automatic |
| **Best For** | Writing quality, cost | OpenAI ecosystem, existing tools |

## Key Differences from Claude SDK

### 1. Function Execution Model

**Claude SDK:**
- Built-in execution loop
- Hooks for pre/post tool use
- Automatic tool routing

**OpenAI Assistants:**
- Manual run loop polling
- Handle `requires_action` status
- Submit tool outputs manually

### 2. Tool Format

**Claude SDK:**
```python
{
    "name": "create_discount",
    "description": "...",
    "input_schema": {...}  # JSON Schema
}
```

**OpenAI:**
```python
{
    "type": "function",
    "function": {
        "name": "create_discount",
        "description": "...",
        "parameters": {...}  # JSON Schema
    }
}
```

### 3. Cost Structure

**Claude SDK (Sonnet 4.5):**
- Input: $3/1M tokens
- Output: $15/1M tokens
- Typical execution: ~$0.08

**OpenAI (GPT-4 Turbo):**
- Input: $10/1M tokens
- Output: $30/1M tokens
- Typical execution: ~$0.15

### 4. Custom Tool Integration

**Both support direct tool passing:**

Claude SDK:
```python
ClaudeAgentOptions(
    tools=composio_tools + custom_tools,
    tool_executors=custom_tool_executors
)
```

OpenAI Assistants:
```python
client.beta.assistants.create(
    tools=composio_tools + custom_functions
)
# Handle execution in run loop
```

## When to Use OpenAI vs Claude

**✅ Use OpenAI Assistants When:**

- **Existing OpenAI infrastructure** - Already using OpenAI platform
- **Code interpreter needed** - Built-in code execution
- **File search required** - Built-in retrieval
- **GPT-4 preference** - Team prefers GPT-4 capabilities
- **Wider model selection** - Access to GPT-4, GPT-4 Turbo, etc.

**✅ Use Claude Agent SDK When:**

- **Cost optimization** - 50% cheaper per execution
- **Writing quality** - Superior text generation
- **Built-in hooks** - Need pre/post tool validation
- **Simpler code** - Less boilerplate (no manual run loop)
- **Context compaction** - Automatic long-context management

## Migration Path

### From Claude SDK to OpenAI

1. **Workflow configs** - No changes needed (platform-agnostic)
2. **Tool format** - Use Composio's `as_tools="openai"`
3. **Custom tools** - Convert to OpenAI function format
4. **Execution** - Implement run loop with polling
5. **Validation** - Move hooks to run loop logic

### Code Comparison

**Claude SDK:**
```python
options = ClaudeAgentOptions(
    system_prompt="...",
    tools=tools,
    hooks={...}
)
client = ClaudeSDKClient(options=options)
result = await client.run(query)
```

**OpenAI:**
```python
assistant = await client.beta.assistants.create(
    instructions="...",
    tools=tools
)
run = await client.beta.threads.runs.create(...)
# Poll until completion
while run.status in ["queued", "in_progress", "requires_action"]:
    # Handle function calls
```

## Related Patterns

- **[[claude-agent-email-automation]]**: Claude Agent SDK version of this pattern
- **[[composio]]**: Tool integration platform used for both
- **OpenAI Assistants API**: Official OpenAI documentation
- **[[multi-tool-agent]]**: Alternative multi-tool coordination patterns

## Resources

**Implementation:**
- [OpenAI Assistants API Docs](https://platform.openai.com/docs/assistants/overview)
- [Composio + OpenAI Guide](https://docs.composio.dev/framework/openai)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

**Examples:**
- [Composio OpenAI Examples](https://github.com/ComposioHQ/composio/tree/main/python/examples/openai)
- [OpenAI Assistants Cookbook](https://cookbook.openai.com/examples/assistants_api_overview_python)

---

## Changelog

- **2025-10-10**: Initial example created showing OpenAI Assistants API + Composio integration
  - Same architecture as Claude SDK example but adapted for OpenAI
  - Custom functions work just like Composio tools - pass directly
  - Demonstrates run loop management, function execution, tool integration
  - Cost comparison and migration guidance included
  - Fully relies on Composio's 250+ authenticated tools
