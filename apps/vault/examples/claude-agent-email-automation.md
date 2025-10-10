---
title: Email Automation with Claude Agent SDK and Composio
type: example
tags: [agent, claude-agent-sdk, composio, email, automation, hooks, subagents, mcp, tool-orchestration]
created: 2025-10-10
updated: 2025-10-10
---

# Email Automation with Claude Agent SDK and Composio

## Overview

This example demonstrates building an autonomous email automation agent using [[claude-agent-sdk]] integrated with [[composio]] tools. The pattern replaces rigid multi-phase orchestration with Claude's flexible agent loop, enabling dynamic tool selection, parallel processing, and intelligent iteration.

**Key Innovation**: Combining Claude SDK's autonomous agent capabilities with Composio's 250+ authenticated tools to create an email assistant that handles irregular, non-standard requests better than fixed workflow approaches.

**Use Case**: "Downstream" email automation where tasks are less regular - drafting responses, deciding which tools to call, coordinating across multiple systems (Gmail, Calendar, Slack, Notion, HubSpot, etc.).

**Technologies:**
- **[[claude-agent-sdk]]**: Autonomous agent framework with built-in loop, hooks, subagents
- **[[composio]]**: Tool integration platform providing authenticated access to Gmail, Calendar, etc.
- **[[model-context-protocol|MCP]]**: In-process MCP servers for custom tools
- **Python asyncio**: Async execution for parallel subagent processing

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLAUDE AGENT SDK ORCHESTRATION                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   Main Orchestrator Agent  │
                    │   (ClaudeSDKClient)        │
                    └───────────┬───────────────┘
                                │
                    Automatic Agent Loop (gather-action-verify-repeat)
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Calendar   │  │    Email     │  │   Research   │
        │   Subagent   │  │  Subagent    │  │  Subagent    │
        │  (parallel)  │  │  (parallel)  │  │  (parallel)  │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                  │
               ▼                 ▼                  ▼
      ┌────────────────────────────────────────────────────┐
      │            TOOL EXECUTION LAYER                     │
      ├────────────────────────────────────────────────────┤
      │  Composio Tools    │  Custom Tools  │  Native Tools│
      │  - Gmail           │  - Business    │  - WebSearch │
      │  - Calendar        │    Logic       │  - Read/Write│
      │  - Slack           │  - Templates   │  - Bash      │
      │  - Notion          │  - Validation  │              │
      └────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │    HOOKS & VALIDATION      │
                    ├───────────────────────────┤
                    │  PreToolUse: Safety checks │
                    │  PostToolUse: Quality validation│
                    │  Deterministic (no LLM)   │
                    └───────────────────────────┘
```

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

### 1. Main Orchestrator Agent

The primary agent that handles email automation end-to-end:

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
from composio import Composio
import os

async def create_email_orchestrator(user_id: str, toolkit_rules: dict):
    """
    Create main orchestrator agent with Composio integration

    Args:
        user_id: User's email for Composio authentication
        toolkit_rules: Rules for tool usage and business logic
    """

    # Fetch authenticated Composio tools for this user
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    composio_tools = composio.tools.get(
        user_id=user_id,
        toolkits=["gmail", "googlecalendar", "slack", "notion"],
        limit=100
    )

    # Filter to whitelisted tools for security
    allowed_tool_names = [
        "GMAIL_CREATE_DRAFT",
        "GMAIL_SEND_EMAIL",
        "GMAIL_SEARCH",
        "GOOGLECALENDAR_FIND_FREE_TIME",
        "GOOGLECALENDAR_CREATE_EVENT",
        "SLACK_SEND_MESSAGE",
        "NOTION_CREATE_PAGE"
    ]

    options = ClaudeAgentOptions(
        system_prompt=f"""You are an autonomous email automation assistant for Cheerful.

Your role:
- Analyze incoming emails and determine appropriate actions
- Draft professional, context-aware responses
- Coordinate across multiple systems (email, calendar, slack, notion)
- Handle irregular, non-standard requests intelligently
- Work autonomously until tasks are complete

Business Rules:
{format_rules(toolkit_rules)}

Key Principles:
1. Always draft emails before sending (create draft first, verify, then send)
2. Check calendar availability before proposing meeting times
3. Match the sender's tone and communication style
4. Include all necessary context from email thread history
5. When uncertain, research relevant information before responding
6. Coordinate parallel actions when possible (e.g., draft email while checking calendar)

You have access to:
- Gmail: drafting, sending, searching emails
- Google Calendar: checking availability, creating events
- Slack: sending notifications to team
- Notion: creating documentation/notes
- Web search: researching topics mentioned in emails
- File system: reading templates, saving drafts

Always complete the full workflow. Don't stop until:
- Email response is sent OR draft is ready for review
- Any required calendar events are created
- All necessary follow-up actions are completed""",

        allowed_tools=allowed_tool_names + ["Read", "Write", "WebSearch"],

        # Accept email drafts automatically, but require approval for sends
        permission_mode='acceptEdits',

        # Allow up to 20 iterations for complex cases
        max_turns=20,

        # Hooks for validation and monitoring
        hooks={
            "PreToolUse": [
                HookMatcher(
                    tool_names=["GMAIL_SEND_EMAIL"],
                    handler=validate_email_before_send
                ),
                HookMatcher(
                    tool_names=["GOOGLECALENDAR_CREATE_EVENT"],
                    handler=validate_calendar_event
                )
            ],
            "PostToolUse": [
                HookMatcher(
                    handler=track_tool_usage
                ),
                HookMatcher(
                    tool_names=["GMAIL_CREATE_DRAFT"],
                    handler=validate_draft_quality
                )
            ]
        },

        # Working directory for templates and drafts
        cwd=f"/app/workspace/{user_id}",

        # MCP servers for custom tools
        mcp_servers={
            "cheerful_custom": create_custom_tools_mcp_server()
        }
    )

    return ClaudeSDKClient(options=options)


def format_rules(toolkit_rules: dict) -> str:
    """Format business rules for system prompt"""
    rules_text = []
    for toolkit, rule in toolkit_rules.items():
        rules_text.append(f"- {toolkit}: {rule}")
    return "\n".join(rules_text)
```

### 2. Custom Tools via In-Process MCP

Extend capabilities beyond Composio with custom business logic:

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool(
    "analyze_email_intent",
    "Extract intent and key information from email thread",
    {"thread_context": dict, "email_content": dict}
)
async def analyze_email_intent(args):
    """
    Custom analysis tool for understanding email context

    Returns structured data about email intent, urgency, key entities
    """
    thread = args['thread_context']
    email = args['email_content']

    # Your custom business logic here
    intent = extract_intent(email['body'])
    entities = extract_entities(email['body'])
    urgency = calculate_urgency(thread, email)

    return {
        "content": [{
            "type": "text",
            "text": f"""Email Analysis:
Intent: {intent['primary']} (confidence: {intent['confidence']})
Key Entities: {', '.join(entities)}
Urgency: {urgency}/10
Requires Tools: {suggest_tools(intent, entities)}"""
        }]
    }


@tool(
    "load_email_template",
    "Load pre-approved email template by name",
    {"template_name": str, "variables": dict}
)
async def load_email_template(args):
    """Load and populate email template"""
    template = await get_template(args['template_name'])
    populated = template.format(**args.get('variables', {}))

    return {
        "content": [{
            "type": "text",
            "text": populated
        }]
    }


@tool(
    "check_compliance",
    "Verify email draft meets compliance requirements",
    {"draft_content": str, "recipient_domain": str}
)
async def check_compliance(args):
    """Compliance validation for email drafts"""
    draft = args['draft_content']
    domain = args['recipient_domain']

    # Check for:
    # - Required disclaimers
    # - Prohibited content
    # - Domain-specific rules

    issues = validate_compliance(draft, domain)

    if issues:
        return {
            "content": [{
                "type": "text",
                "text": f"Compliance issues found:\n" + "\n".join(issues)
            }]
        }

    return {
        "content": [{
            "type": "text",
            "text": "Draft passes all compliance checks"
        }]
    }


def create_custom_tools_mcp_server():
    """Create in-process MCP server with custom tools"""
    return create_sdk_mcp_server(
        name="cheerful-custom-tools",
        version="1.0.0",
        tools=[
            analyze_email_intent,
            load_email_template,
            check_compliance
        ]
    )
```

### 3. Deterministic Validation Hooks

Replace LLM-based validation with fast, deterministic checks:

```python
def validate_email_before_send(hook_context):
    """
    PreToolUse hook: Validate before sending email

    Checks:
    - Draft was created and reviewed
    - Compliance validation passed
    - Recipient is valid
    - No sensitive data exposed

    Returns: {"allow": True/False, "reason": str}
    """
    tool_input = hook_context.tool_input

    # Extract email details
    draft_id = tool_input.get('draft_id')
    to_address = tool_input.get('to')

    # Check 1: Draft exists
    if not draft_id:
        return {
            "deny": True,
            "reason": "Must create draft before sending"
        }

    # Check 2: Recipient is valid
    if not is_valid_recipient(to_address):
        return {
            "deny": True,
            "reason": f"Invalid recipient: {to_address}"
        }

    # Check 3: Compliance (from custom data passed through context)
    if not hook_context.custom_data.get('compliance_checked'):
        return {
            "deny": True,
            "reason": "Compliance check required before sending"
        }

    # All checks pass
    return {"allow": True}


def validate_calendar_event(hook_context):
    """
    PreToolUse hook: Validate calendar event before creation

    Checks:
    - Time is within working hours
    - No double-booking
    - Duration is reasonable
    """
    tool_input = hook_context.tool_input

    start_time = parse_datetime(tool_input.get('start_time'))
    duration = tool_input.get('duration', 0)

    # Check 1: Working hours
    if not is_within_working_hours(start_time):
        return {
            "deny": True,
            "reason": "Event must be during working hours (9am-5pm)"
        }

    # Check 2: Reasonable duration
    if duration > 240:  # 4 hours
        return {
            "deny": True,
            "reason": "Event duration too long (max 4 hours)"
        }

    # Check 3: No conflicts (would require calendar API call)
    # For demo, assume we have this data in context
    if hook_context.custom_data.get('has_conflict'):
        return {
            "deny": True,
            "reason": "Calendar conflict detected"
        }

    return {"allow": True}


def validate_draft_quality(hook_context):
    """
    PostToolUse hook: Validate email draft quality after creation

    Checks:
    - Minimum length
    - Has proper greeting/closing
    - No obvious errors
    """
    tool_output = hook_context.tool_output

    # Extract draft content from tool result
    draft_content = extract_draft_content(tool_output)

    # Quality checks
    issues = []

    if len(draft_content) < 50:
        issues.append("Draft too short (min 50 characters)")

    if not has_greeting(draft_content):
        issues.append("Missing greeting")

    if not has_closing(draft_content):
        issues.append("Missing closing/signature")

    if has_obvious_errors(draft_content):
        issues.append("Potential errors detected")

    if issues:
        # Trigger retry by marking as failed
        return {
            "retry": True,
            "reason": "Draft quality issues: " + "; ".join(issues)
        }

    return {"allow": True}


def track_tool_usage(hook_context):
    """
    PostToolUse hook: Track all tool usage for monitoring
    """
    # Log to your monitoring system
    log_tool_call(
        tool_name=hook_context.tool_name,
        user_id=hook_context.custom_data.get('user_id'),
        success=not hook_context.error,
        timestamp=datetime.now()
    )

    return {"allow": True}
```

### 4. Specialized Subagents for Parallel Processing

Create specialized agents that can work in parallel:

```python
from claude_agent_sdk import Agent, ClaudeAgentOptions

def create_calendar_subagent(composio_tools: list):
    """
    Subagent specialized in calendar operations

    Can run in parallel with email subagent
    """
    return Agent(
        name="Calendar Specialist",
        options=ClaudeAgentOptions(
            system_prompt="""You are a calendar management specialist.

Your responsibilities:
- Check calendar availability for meeting requests
- Create calendar events with proper details
- Find optimal meeting times based on constraints
- Add Google Meet links automatically
- Respect working hours (9am-5pm in user's timezone)

Always provide 2-3 time options when possible.
Include timezone information in all responses.""",

            allowed_tools=[
                "GOOGLECALENDAR_FIND_FREE_TIME",
                "GOOGLECALENDAR_CREATE_EVENT",
                "GOOGLECALENDAR_LIST_EVENTS"
            ],

            permission_mode='acceptEdits',
            max_turns=10
        )
    )


def create_email_drafter_subagent(composio_tools: list):
    """
    Subagent specialized in email drafting

    Can run in parallel with calendar subagent
    """
    return Agent(
        name="Email Drafter",
        options=ClaudeAgentOptions(
            system_prompt="""You are an expert email writer.

Your responsibilities:
- Draft professional, context-aware email responses
- Match the sender's tone and communication style
- Include all necessary information from thread history
- Use proper greetings and closings
- Be concise but complete
- Reference specific points from the original email

Style Guidelines:
- Professional but friendly
- Use bullet points for multiple items
- Include clear call-to-action when needed
- Proofread for grammar and clarity

Always create a draft first (GMAIL_CREATE_DRAFT) before considering sending.""",

            allowed_tools=[
                "GMAIL_CREATE_DRAFT",
                "GMAIL_SEARCH",
                "Read",  # For templates
                "mcp__cheerful_custom__load_email_template"
            ],

            permission_mode='acceptEdits',
            max_turns=10
        )
    )


def create_research_subagent():
    """
    Subagent specialized in research

    Can gather information in parallel with other tasks
    """
    return Agent(
        name="Research Specialist",
        options=ClaudeAgentOptions(
            system_prompt="""You are a research specialist.

Your responsibilities:
- Research topics mentioned in emails
- Gather relevant information from the web
- Summarize findings concisely
- Provide sources for all information
- Focus on recent, relevant data

Always cite sources and indicate recency of information.""",

            allowed_tools=[
                "WebSearch",
                "WebFetch",
                "Read"
            ],

            permission_mode='plan',  # Read-only for research
            max_turns=10
        )
    )
```

### 5. Parallel Execution with Subagents

Coordinate multiple subagents working simultaneously:

```python
import asyncio
from datetime import datetime

async def handle_meeting_request_parallel(
    email_content: dict,
    thread_context: dict,
    user_settings: dict,
    composio_tools: list
):
    """
    Handle meeting request using parallel subagents

    Executes calendar check and email draft simultaneously
    """

    # Create specialized subagents
    calendar_agent = create_calendar_subagent(composio_tools)
    email_agent = create_email_drafter_subagent(composio_tools)
    research_agent = create_research_subagent()

    # Extract meeting request details
    meeting_topic = email_content.get('subject', '')
    preferred_times = extract_time_preferences(email_content['body'])

    # Define parallel tasks
    async def calendar_task():
        """Find availability and create event"""
        query = f"""Find available times for a meeting about '{meeting_topic}'.
        Preferred times: {preferred_times}
        Duration: 30 minutes
        Create an event if availability found."""

        result = await calendar_agent.run(query)
        return result

    async def email_draft_task():
        """Draft response email"""
        query = f"""Draft a professional email response to:
        From: {email_content['from']}
        Subject: {email_content['subject']}

        Original message:
        {email_content['body']}

        Thread history:
        {format_thread(thread_context)}

        The email should confirm meeting interest and reference the calendar availability."""

        result = await email_agent.run(query)
        return result

    async def research_task():
        """Research meeting topic (if needed)"""
        if meeting_topic and requires_research(meeting_topic):
            query = f"Research recent information about: {meeting_topic}"
            result = await research_agent.run(query)
            return result
        return None

    # Execute all tasks in parallel
    start_time = datetime.now()

    calendar_result, email_result, research_result = await asyncio.gather(
        calendar_task(),
        email_draft_task(),
        research_task(),
        return_exceptions=True
    )

    duration = (datetime.now() - start_time).total_seconds()

    # Combine results
    return {
        "calendar": calendar_result,
        "email_draft": email_result,
        "research": research_result,
        "execution_time_seconds": duration,
        "parallel_execution": True
    }
```

### 6. Main Execution Function

Bring it all together with the main orchestrator:

```python
from langfuse import observe
from composio import Composio
import logging

logger = logging.getLogger(__name__)


@observe()
async def process_email_with_claude_sdk(
    email_content: dict,
    user_settings: dict,
    thread_context: dict,
    toolkits: List[str],
    toolkit_rules: Dict[str, str],
    campaign_rules: Dict[str, str],
    use_parallel_subagents: bool = False
) -> dict:
    """
    Process email using Claude Agent SDK with Composio integration

    Args:
        email_content: Email data being processed
        user_settings: User configuration and preferences
        thread_context: Email thread history and context
        toolkits: Available Composio toolkits (e.g., ["gmail", "googlecalendar"])
        toolkit_rules: Rules for how to use each toolkit
        campaign_rules: Campaign-specific automation rules
        use_parallel_subagents: Whether to use parallel subagent execution

    Returns:
        dict with keys: success, output, tools_used, iterations, duration_ms
    """
    try:
        # Initialize Composio
        composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
        user_id = user_settings.get("agent_true_email", "")

        # Fetch authenticated tools
        composio_tools = composio.tools.get(
            user_id=user_id,
            toolkits=toolkits,
            limit=100
        )

        # Decide execution strategy
        if use_parallel_subagents and is_complex_request(email_content):
            # Use parallel subagents for complex requests
            logger.info("Using parallel subagent execution")

            result = await handle_meeting_request_parallel(
                email_content=email_content,
                thread_context=thread_context,
                user_settings=user_settings,
                composio_tools=composio_tools
            )

            return {
                "success": True,
                "strategy": "parallel_subagents",
                "result": result
            }

        else:
            # Use main orchestrator agent for standard requests
            logger.info("Using main orchestrator agent")

            start_time = datetime.now()

            # Create orchestrator
            client = await create_email_orchestrator(
                user_id=user_id,
                toolkit_rules=toolkit_rules
            )

            # Build query with full context
            query = build_query_from_email(
                email_content=email_content,
                thread_context=thread_context,
                campaign_rules=campaign_rules,
                user_settings=user_settings
            )

            # Execute with streaming for real-time progress
            result = await client.run_streamed(query)

            # Collect output
            output_messages = []
            tools_used = []

            async for event in result.stream_events():
                if event.type == "tool_call":
                    tools_used.append(event.tool_name)
                    logger.info(f"Tool used: {event.tool_name}")

                if event.type == "message":
                    output_messages.append(event.content)

            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

            return {
                "success": True,
                "strategy": "main_orchestrator",
                "output": "\n".join(output_messages),
                "tools_used": tools_used,
                "iterations": result.turn_count,
                "duration_ms": duration_ms
            }

    except Exception as e:
        logger.error(f"Error in Claude SDK email processing: {str(e)}")
        raise


def build_query_from_email(
    email_content: dict,
    thread_context: dict,
    campaign_rules: dict,
    user_settings: dict
) -> str:
    """
    Build comprehensive query for Claude agent

    Includes all context needed for autonomous execution
    """
    query = f"""Process this email and take appropriate actions:

FROM: {email_content['from']}
TO: {email_content['to']}
SUBJECT: {email_content['subject']}
DATE: {email_content.get('date', 'N/A')}

EMAIL BODY:
{email_content['body']}

THREAD HISTORY:
{format_thread_history(thread_context)}

USER PREFERENCES:
{format_user_preferences(user_settings)}

CAMPAIGN RULES:
{format_campaign_rules(campaign_rules)}

YOUR TASK:
1. Analyze the email and determine what actions are needed
2. Execute those actions autonomously (draft emails, check calendar, etc.)
3. Work until the task is complete - you'll know when you're done
4. Provide a summary of what you accomplished

Remember:
- Always create drafts before sending emails
- Check calendar availability before proposing times
- Match the sender's communication style
- Be professional but friendly
- Include all relevant context from the thread

Begin processing."""

    return query


def is_complex_request(email_content: dict) -> bool:
    """Determine if request is complex enough for parallel subagents"""
    body = email_content.get('body', '').lower()

    # Indicators of complexity
    complex_indicators = [
        'meeting' in body and 'calendar' in body,
        len(body) > 500,  # Long email
        'urgent' in body or 'asap' in body,
        'multiple' in body or 'several' in body
    ]

    return sum(complex_indicators) >= 2


def format_thread_history(thread_context: dict) -> str:
    """Format thread history for context"""
    if not thread_context.get('previous_emails'):
        return "No previous emails in thread"

    history = []
    for email in thread_context['previous_emails'][-3:]:  # Last 3 emails
        history.append(f"""
[{email.get('date')}] {email.get('from')}:
{email.get('body', '')[:200]}...
""")

    return "\n---\n".join(history)


def format_user_preferences(user_settings: dict) -> str:
    """Format user preferences for context"""
    return f"""
- Timezone: {user_settings.get('timezone', 'UTC')}
- Working Hours: {user_settings.get('working_hours', '9am-5pm')}
- Email Signature: {user_settings.get('signature', 'Standard signature')}
- Preferred Meeting Duration: {user_settings.get('default_meeting_duration', 30)} minutes
"""


def format_campaign_rules(campaign_rules: dict) -> str:
    """Format campaign rules for context"""
    rules = []
    for rule_type, rule_text in campaign_rules.items():
        rules.append(f"- {rule_type}: {rule_text}")
    return "\n".join(rules)
```

## Complete Example Usage

### Basic Usage

```python
import asyncio
from composio import Composio
import os

async def main():
    # Sample email content
    email_content = {
        "from": "john.doe@example.com",
        "to": "me@cheerful.com",
        "subject": "Meeting Request - Q1 Planning",
        "body": """Hi,

Can we schedule a 30-minute meeting next week to discuss Q1 planning?
I'm available Tuesday-Thursday afternoons, preferably 2-4pm.

Let me know what works for you.

Thanks,
John"""
    }

    thread_context = {
        "previous_emails": [],
        "participants": ["john.doe@example.com", "me@cheerful.com"]
    }

    user_settings = {
        "agent_true_email": "me@cheerful.com",
        "timezone": "America/Los_Angeles",
        "working_hours": "9am-5pm",
        "default_meeting_duration": 30,
        "signature": "Best regards,\nYour Name\nCheerful Team"
    }

    toolkit_rules = {
        "gmail": "Always draft before sending. Use professional tone.",
        "googlecalendar": "Respect working hours. Add Google Meet link automatically.",
        "slack": "Notify team of important scheduling changes."
    }

    campaign_rules = {
        "meeting_requests": "Respond within 1 hour. Propose 2-3 time options."
    }

    # Process email with Claude SDK
    result = await process_email_with_claude_sdk(
        email_content=email_content,
        user_settings=user_settings,
        thread_context=thread_context,
        toolkits=["gmail", "googlecalendar", "slack"],
        toolkit_rules=toolkit_rules,
        campaign_rules=campaign_rules,
        use_parallel_subagents=True
    )

    print(f"Success: {result['success']}")
    print(f"Strategy: {result['strategy']}")
    print(f"Duration: {result.get('duration_ms', 'N/A')}ms")
    print(f"Tools Used: {result.get('tools_used', [])}")
    print(f"\nOutput:\n{result.get('output', result.get('result'))}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Expected Output

```
Success: True
Strategy: parallel_subagents
Duration: 3200ms
Tools Used: ['GOOGLECALENDAR_FIND_FREE_TIME', 'GOOGLECALENDAR_CREATE_EVENT', 'GMAIL_CREATE_DRAFT', 'WebSearch']

Output:
✅ Calendar Check Complete:
   - Found 3 available slots:
     • Tuesday, Oct 14 at 2:00 PM
     • Wednesday, Oct 15 at 3:00 PM
     • Thursday, Oct 16 at 2:30 PM
   - Created calendar event for Tuesday, Oct 14 at 2:00 PM
   - Google Meet link: https://meet.google.com/abc-defg-hij

✅ Email Draft Created:
   Subject: Re: Meeting Request - Q1 Planning

   Hi John,

   Thanks for reaching out! I'd be happy to discuss Q1 planning with you.

   I've checked my calendar and have the following availability next week:
   • Tuesday, October 14 at 2:00 PM PT
   • Wednesday, October 15 at 3:00 PM PT
   • Thursday, October 16 at 2:30 PM PT

   I've tentatively scheduled us for Tuesday, October 14 at 2:00 PM (30 minutes).
   Google Meet link: https://meet.google.com/abc-defg-hij

   Please let me know if this works for you or if you'd prefer one of the other times.

   Looking forward to our discussion!

   Best regards,
   Your Name
   Cheerful Team

✅ Background Research:
   - Q1 typically refers to January-March fiscal quarter
   - Common Q1 planning topics: budget allocation, goal setting, project prioritization
   - Recommended agenda items: review Q4 performance, set Q1 OKRs, resource planning

Execution Summary:
- 3 subagents executed in parallel
- Total time: 3.2 seconds (vs ~8s sequential)
- 4 tools called across subagents
- Draft ready for review/approval
```

## Benefits for Cheerful Email Automation

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

### 3. Better Email Quality

- **Claude Sonnet 4.5**: Superior writing quality vs GPT-4
- **Context Awareness**: Automatic compaction maintains thread history
- **Verification Loop**: PostToolUse hooks ensure draft quality
- **Template Integration**: Custom tools for brand consistency

### 4. Flexible Tool Selection

**Current Approach:**
```python
# Rigid planning - must decide upfront
tool_flow = {
    "steps": [
        {"tools": ["GMAIL_CREATE_DRAFT"]},
        {"tools": ["GOOGLECALENDAR_FIND_FREE_TIME"]},
        # Fixed sequence
    ]
}
```

**Claude SDK Approach:**
```python
# Agent dynamically decides based on email content
allowed_tools = [
    "GMAIL_*",  # All Gmail tools
    "GOOGLECALENDAR_*",  # All Calendar tools
    "SLACK_*",  # All Slack tools
    "NOTION_*",  # All Notion tools
    "WebSearch", "Read", "Write"
]
# Agent picks what's needed for THIS specific email
```

**Benefit**: Handles irregular requests (urgent meetings, multi-party coordination, research needs) without pre-planning.

### 5. Autonomous Iteration

**Current Approach:**
- Max 10 iterations hardcoded
- Must validate after each step
- Can't adapt to unexpected results

**Claude SDK Approach:**
- Configurable max_turns (e.g., 20)
- Agent iterates until task complete
- Self-corrects based on tool results
- Hooks provide safety rails

**Example**: If calendar unavailable, agent automatically:
1. Searches for alternative times
2. Updates draft with new options
3. Retries until successful

### 6. Production-Ready Error Handling

**Hooks provide deterministic safety:**

```python
# Prevent sending emails without compliance check
@hook PreToolUse(GMAIL_SEND_EMAIL)
def ensure_compliance(ctx):
    if not ctx.custom_data['compliance_checked']:
        return {"deny": True}

# Prevent calendar conflicts
@hook PreToolUse(GOOGLECALENDAR_CREATE_EVENT)
def prevent_double_booking(ctx):
    if has_conflict(ctx.tool_input):
        return {"deny": True, "reason": "Calendar conflict"}

# Ensure draft quality
@hook PostToolUse(GMAIL_CREATE_DRAFT)
def validate_draft(ctx):
    if not meets_quality_standards(ctx.tool_output):
        return {"retry": True}
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

- **2025-10-10**: Initial example created showing Claude Agent SDK + Composio integration for email automation with hooks, subagents, and parallel processing
