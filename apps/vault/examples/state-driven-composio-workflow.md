---
title: State-Driven Tool Execution with Composio and OpenAI
type: example
tags: [agent, workflow, composio, openai, pydantic, tools, state-driven, iteration, observability, langfuse, multi-step, structured-outputs]
created: 2025-10-10
updated: 2025-10-10
---

# State-Driven Tool Execution with Composio and OpenAI

## Overview

State-driven execution is an agent pattern that defines explicit goal states upfront and iteratively executes tools until those goals are achieved. Unlike simple prompt-response patterns or reactive tool calling, this approach separates planning from execution and continuously validates progress toward a defined end state.

This example demonstrates a production-grade implementation combining:
- **[[composio]]**: Tool integration platform providing 250+ authenticated tools (Gmail, Slack, GitHub, Calendar, etc.)
- **[[openai-responses-api]]**: Stateless API for agentic workflows with native structured output support
- **Pydantic**: Type-safe data validation enabling self-correcting LLM outputs
- **[[langfuse]]**: Observability platform for tracing execution flows

**When to Use This Pattern:**
- Multi-step workflows requiring goal validation (not just "run until no more tools")
- Complex tool orchestration with dependencies between steps
- Need for execution history and audit trails
- Applications requiring type safety and automatic validation
- Workflows where iteration with context accumulation is beneficial

**Compared to Other Patterns:**
- **vs ReAct**: More explicit planning, fewer LLM calls, better performance for complex tasks
- **vs [[langgraph]] StateGraph**: More lightweight, no graph compilation, simpler for linear workflows
- **vs Single-shot tool calling**: Iterative with validation, can recover from failures

## Architecture

The pattern consists of 6 distinct phases executed in sequence, with phases 4-5 forming an iteration loop:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         INPUT                                         │
│  (email_content, user_settings, thread_context, toolkits, rules)    │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             ▼
                   ┌─────────────────────┐
                   │   PHASE 1:          │
                   │   CLASSIFICATION    │◄──── LLM with Pydantic
                   │                     │      (FlowNeeded model)
                   └──────────┬──────────┘
                              │
                         [Tool calls needed?]
                              │
                    ┌─────────┴─────────┐
                    │ No                │ Yes
                    ▼                   ▼
              ┌──────────┐    ┌─────────────────────┐
              │   EXIT   │    │   PHASE 2:          │
              │  Early   │    │   FINAL STATE       │◄──── LLM with Pydantic
              └──────────┘    │   DEFINITION        │      (FinalState model)
                              └──────────┬──────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   PHASE 3:          │
                              │   TOOL FLOW         │◄──── LLM with Pydantic
                              │   PLANNING          │      (ToolFlow model)
                              └──────────┬──────────┘
                                         │
                ┌────────────────────────┘
                │
                │  [Iteration Loop - Max 10 iterations]
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │         PHASE 4: ITERATIVE EXECUTION              │
    │                                                   │
    │  ┌──────────────────────────────────────────┐   │
    │  │ 4a. Determine Next Tools                 │   │◄──── LLM with Pydantic
    │  │     (composio_determine_tools)           │   │      (response with tool_calls)
    │  └──────────────┬───────────────────────────┘   │
    │                 │                                 │
    │                 ▼                                 │
    │  ┌──────────────────────────────────────────┐   │
    │  │ 4b. Execute via Composio                 │   │◄──── Composio
    │  │     (handle_tool_calls)                  │   │      (auth, API calls, execution)
    │  └──────────────┬───────────────────────────┘   │
    │                 │                                 │
    │                 ▼                                 │
    │  ┌──────────────────────────────────────────┐   │
    │  │ 4c. Generate Summary                     │   │◄──── LLM with Pydantic
    │  │     (composio_summarize_execution)       │   │      (ExecutionSummary model)
    │  └──────────────┬───────────────────────────┘   │
    │                 │                                 │
    │  ┌──────────────▼───────────────────────────┐   │
    │  │ 4d. Record Execution History             │   │
    │  │     (timestamp, duration, result)        │   │
    │  └──────────────────────────────────────────┘   │
    └───────────────────────┬───────────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   PHASE 5:          │
                 │   STATE VALIDATION  │◄──── LLM with Pydantic
                 │                     │      (FinalStateCheck model)
                 └──────────┬──────────┘
                            │
                   [Goal reached?]
                            │
                ┌───────────┴───────────┐
                │ No                    │ Yes
                │ (iterations < 10)     │ (or max iterations)
                │                       │
                ▼                       ▼
        [Loop back to Phase 4]   ┌─────────────────────┐
                                 │   PHASE 6:          │
                                 │   SUMMARIZATION     │◄──── Generate overall summary
                                 │                     │
                                 └──────────┬──────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │   OUTPUT     │
                                    │  (result)    │
                                    └──────────────┘
```

**Key Architectural Principles:**

1. **Explicit State Definition**: Define success criteria before execution begins
2. **Separation of Concerns**: Planning (Phase 3) separated from execution (Phase 4)
3. **Structured Outputs**: Every LLM call returns validated Pydantic models
4. **Iteration with Context**: Each iteration builds on previous summaries
5. **Safety Mechanisms**: Max iterations prevents infinite loops
6. **Audit Trail**: Complete execution history for debugging and compliance

## Key Components

### Phase 1: Classification

**Purpose**: Determine if automated tool execution is needed for this request.

**Function**: `composio_classify_flow_needed()`

**Pydantic Model**:
```python
from pydantic import BaseModel, Field

class FlowNeeded(BaseModel):
    tool_calls_needed: bool = Field(
        description="Whether automated tool execution is required"
    )
    reasoning: str = Field(
        description="Explanation for the decision"
    )
```

**Example Output**:
```python
FlowNeeded(
    tool_calls_needed=True,
    reasoning="Email requests meeting scheduling which requires calendar access and response drafting"
)
```

**Decision Point**: If `tool_calls_needed = False`, exit early with no tool execution.

---

### Phase 2: Final State Definition

**Purpose**: Define the desired end state with explicit completion criteria.

**Function**: `composio_determine_final_state()`

**Pydantic Model**:
```python
class FinalState(BaseModel):
    state_name: str = Field(
        description="Short name for the goal state"
    )
    description: str = Field(
        description="Detailed description of what success looks like"
    )
    completion_criteria: List[str] = Field(
        description="Specific conditions that must all be met"
    )
```

**Example Output**:
```python
FinalState(
    state_name="email_responded_with_meeting",
    description="Email has been responded to with a meeting invite sent to the requester",
    completion_criteria=[
        "Reply email drafted and sent",
        "Calendar event created for proposed time",
        "Event invitation sent to requester",
        "Confirmation received from calendar system"
    ]
)
```

**Key Insight**: This explicit goal definition enables Phase 5 to validate completion, not just check if tools stopped executing.

---

### Phase 3: Tool Flow Planning

**Purpose**: Create a step-by-step execution plan with tool dependencies.

**Function**: `composio_create_tool_flow()`

**Pydantic Models**:
```python
class ToolStep(BaseModel):
    purpose: str = Field(
        description="What this step accomplishes"
    )
    tools_needed: List[str] = Field(
        description="Composio tool names required for this step"
    )
    depends_on: Optional[List[int]] = Field(
        default=None,
        description="Indices of steps that must complete first"
    )

class ToolFlow(BaseModel):
    steps: List[ToolStep] = Field(
        description="Ordered list of execution steps"
    )
    estimated_duration: Optional[int] = Field(
        default=None,
        description="Estimated execution time in seconds"
    )
```

**Example Output**:
```python
ToolFlow(
    steps=[
        ToolStep(
            purpose="Draft meeting response email",
            tools_needed=["GMAIL_CREATE_DRAFT"],
            depends_on=None
        ),
        ToolStep(
            purpose="Check calendar availability for proposed times",
            tools_needed=["GOOGLECALENDAR_FIND_FREE_TIME"],
            depends_on=[0]  # Needs draft to know proposed times
        ),
        ToolStep(
            purpose="Create calendar event at available time",
            tools_needed=["GOOGLECALENDAR_CREATE_EVENT"],
            depends_on=[1]  # Needs availability info
        ),
        ToolStep(
            purpose="Send email response with meeting details",
            tools_needed=["GMAIL_SEND_EMAIL"],
            depends_on=[2]  # Needs event created first
        )
    ],
    estimated_duration=30
)
```

**Analogy**: Similar to [[langgraph]]'s Plan-and-Execute pattern, but more lightweight without graph compilation.

---

### Phase 4: Iterative Execution

**Purpose**: Execute tools step-by-step, adapting based on results.

This phase has 4 sub-steps executed in a loop:

#### 4a. Determine Next Tools

**Function**: `composio_determine_tools()`

**Inputs**:
- `tool_flow`: The plan from Phase 3
- `previous_step`: Summary from last iteration (or empty for first iteration)
- `final_state`: The goal from Phase 2
- `toolkits`: Available Composio tools
- Additional context (rules, settings)

**Output**: OpenAI response object with `tool_calls` populated

**Key Logic**: LLM decides which tools from the plan to call next, considering previous results and remaining steps.

#### 4b. Execute via Composio

**Composio Client**:
```python
from composio import Composio
import os

composio_client = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
```

**Execution**:
```python
from datetime import datetime

start_time = datetime.now()
execution_result = composio_client.provider.handle_tool_calls(
    response=response_with_tools,  # From 4a
    user_id=user_settings.get("agent_true_email", "")
)
duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
```

**What Composio Does**:
1. Authenticates as the user (via `user_id`)
2. Maps tool calls to actual API endpoints (Gmail, Calendar, etc.)
3. Executes API calls with proper parameters
4. Returns structured results

**Benefits**: Abstracts away authentication, API complexity, error handling from individual tool APIs.

#### 4c. Generate Summary

**Function**: `composio_summarize_execution()`

**Pydantic Model**:
```python
class ExecutionSummary(BaseModel):
    summary: str = Field(
        description="Concise summary of what was accomplished in this step"
    )
    data_extracted: Dict[str, Any] = Field(
        description="Structured data extracted from tool results"
    )
    next_steps: Optional[List[str]] = Field(
        default=None,
        description="Suggested next actions based on results"
    )
```

**Example Output**:
```python
ExecutionSummary(
    summary="Created calendar event for meeting on 2025-10-15 at 2:00 PM. Event ID: evt_abc123.",
    data_extracted={
        "event_id": "evt_abc123",
        "event_time": "2025-10-15T14:00:00Z",
        "attendees": ["requester@example.com"],
        "meeting_link": "https://meet.google.com/xyz"
    },
    next_steps=["Send confirmation email with meeting link"]
)
```

**Purpose**: Compress tool execution results into concise context for next iteration, preventing context window bloat.

#### 4d. Record Execution History

**Structure**:
```python
execution_history.append({
    "step_id": current_step,  # From tool flow plan
    "result": execution_result,  # Raw Composio output
    "summary": summary,  # ExecutionSummary from 4c
    "timestamp": datetime.now().isoformat(),
    "duration_ms": duration_ms,
})
```

**Benefits**:
- Complete audit trail for debugging
- Enables replay and analysis
- Supports compliance requirements
- Feeds into Phase 5 validation

---

### Phase 5: State Validation

**Purpose**: Check if the final state defined in Phase 2 has been reached.

**Function**: `composio_check_final_state()`

**Inputs**:
- `final_state_definition`: The goal from Phase 2
- `execution_history`: All recorded steps
- `latest_summary`: Most recent ExecutionSummary

**Pydantic Model**:
```python
class FinalStateCheck(BaseModel):
    is_reached: bool = Field(
        description="Whether all completion criteria are satisfied"
    )
    reasoning: str = Field(
        description="Explanation of validation decision"
    )
    missing_criteria: Optional[List[str]] = Field(
        default=None,
        description="Criteria not yet met (if is_reached=False)"
    )
```

**Example Output (Success)**:
```python
FinalStateCheck(
    is_reached=True,
    reasoning="All criteria met: email sent, calendar event created, invitation delivered, confirmation received",
    missing_criteria=None
)
```

**Example Output (Continue)**:
```python
FinalStateCheck(
    is_reached=False,
    reasoning="Calendar event created but email not yet sent",
    missing_criteria=["Reply email drafted and sent"]
)
```

**Decision Logic**:
```python
if final_state_dict["is_reached"]:
    final_state_reached = True
    break  # Exit iteration loop
else:
    # Continue to next iteration
    iteration_count += 1
```

---

### Phase 6: Summarization

**Purpose**: Generate comprehensive summary of all executions.

**Function**: `generate_overall_summary()`

**Logic**:
```python
def generate_overall_summary(execution_history: List[Dict[str, Any]]) -> str:
    """Generate a comprehensive summary of all executions"""
    if not execution_history:
        return "No executions performed."

    summaries = []
    for idx, step in enumerate(execution_history, 1):
        step_summary = step.get("summary", {})
        summaries.append(
            f"Step {idx}: {step_summary.get('summary', 'No summary available')}"
        )

    return "\n".join(summaries)
```

**Example Output**:
```
Step 1: Drafted email response proposing meeting times
Step 2: Checked calendar availability, found slot on 2025-10-15 at 2:00 PM
Step 3: Created calendar event for meeting on 2025-10-15 at 2:00 PM. Event ID: evt_abc123.
Step 4: Sent email response with meeting invitation and Google Meet link
```

**Final Return**:
```python
result = {
    "success": final_state_reached,
    "final_state": final_state,
    "tool_flow_plan": tool_flow,
    "execution_history": execution_history,
    "iterations": iteration_count,
    "outcome_summary": outcome_summary,
}
```

## Implementation Pattern

### Main Orchestration Function

```python
from langfuse import observe
from composio import Composio
import os
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

@observe()
def composio_state_driven_execute(
    email_content: dict,
    user_settings: dict,
    thread_context: dict,
    toolkits: List[str],
    toolkit_rules: Dict[str, str],
    campaign_rules: Dict[str, str],
    toolkit_whitelist: Dict[str, List[str]],
) -> dict:
    """
    State-driven Composio execution with intelligent planning and iteration

    Args:
        email_content: Email data being processed
        user_settings: User configuration and preferences
        thread_context: Email thread history and context
        toolkits: Available tool categories (e.g., ["gmail", "googlecalendar"])
        toolkit_rules: Rules for how to use each toolkit
        campaign_rules: Campaign-specific automation rules
        toolkit_whitelist: Allowed tools per toolkit for security

    Returns:
        dict with keys: success, final_state, tool_flow_plan,
                       execution_history, iterations, outcome_summary
    """
    try:
        # PHASE 1: Classification
        logger.info("Determining if tool flow needed")

        toolkits = get_user_tools(
            user_settings.get("agent_true_email", ""),
            toolkits
        )
        toolkits = [
            toolkit for toolkit in toolkits
            if toolkit.get("function", {}).get("name", "") in toolkit_whitelist
        ]

        flow_needed = composio_classify_flow_needed(
            toolkits=toolkits,
            toolkit_rules=toolkit_rules,
            campaign_rules=campaign_rules,
            thread_context=thread_context,
            user_settings=user_settings,
        )

        if not flow_needed["tool_calls_needed"]:
            return {
                "success": True,
                "outcome_summary": "No tool calls needed",
            }

        # PHASE 2: Final State Definition
        logger.info("Determining final state")
        final_state = composio_determine_final_state(
            email_content=email_content,
            thread_context=thread_context,
            toolkit_rules=toolkit_rules,
            user_settings=user_settings,
            toolkits=toolkits,
            campaign_rules=campaign_rules,
        )

        # PHASE 3: Tool Flow Planning
        logger.info(f"Creating tool flow plan for state: {final_state.get('state_name')}")
        tool_flow = composio_create_tool_flow(
            final_state=final_state,
            toolkits=toolkits,
            toolkit_rules=toolkit_rules,
            campaign_rules=campaign_rules,
            user_settings=user_settings,
        )

        # PHASE 4-5: Iterative Execution with Validation
        execution_history = []
        final_state_reached = False
        iteration_count = 0
        max_iterations = 10

        composio_client = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

        logger.info(f"Starting iterative execution with max {max_iterations} iterations")
        summary = {}

        while not final_state_reached and iteration_count < max_iterations:
            logger.info(f"Starting iteration {iteration_count + 1}")

            # PHASE 4a: Determine which tools to call next
            response_with_tools = composio_determine_tools(
                tool_flow=tool_flow,
                previous_step=summary,
                final_state=final_state,
                user_settings=user_settings,
                toolkit_rules=toolkit_rules,
                campaign_rules=campaign_rules,
                toolkits=toolkits,
            )

            # PHASE 4b: Execute via Composio
            start_time = datetime.now()
            execution_result = composio_client.provider.handle_tool_calls(
                response=response_with_tools,
                user_id=user_settings.get("agent_true_email", ""),
            )
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

            # Get current step info from tool flow
            current_step = {"purpose": f"Iteration {iteration_count + 1}"}
            if tool_flow.get("steps") and len(tool_flow["steps"]) > iteration_count:
                current_step = tool_flow["steps"][iteration_count]

            # PHASE 4c: Generate summary
            summary = composio_summarize_execution(
                tool_flow=tool_flow,
                execution_result=execution_result,
                step_purpose=current_step.get("purpose", ""),
                user_settings=user_settings,
            )

            # PHASE 4d: Record execution
            execution_history.append({
                "step_id": current_step,
                "result": execution_result,
                "summary": summary,
                "timestamp": datetime.now().isoformat(),
                "duration_ms": duration_ms,
            })

            # PHASE 5: Check if final state reached
            final_state_dict = composio_check_final_state(
                final_state_definition=final_state,
                execution_history=execution_history,
                latest_summary=summary,
                user_settings=user_settings,
            )

            if final_state_dict["is_reached"]:
                final_state_reached = True
                logger.info(f"Final state reached at iteration {iteration_count + 1}")

            execution_history[-1]["after_execution_summary"] = final_state_reached

            iteration_count += 1

        # PHASE 6: Generate final summary
        outcome_summary = generate_overall_summary(execution_history)

        result = {
            "success": final_state_reached,
            "final_state": final_state,
            "tool_flow_plan": tool_flow,
            "execution_history": execution_history,
            "iterations": iteration_count,
            "outcome_summary": outcome_summary,
        }

        logger.info(
            f"Composio execution completed. Success: {final_state_reached}, "
            f"Iterations: {iteration_count}"
        )

        return result

    except Exception as e:
        logger.error(f"Error in composio state-driven execution: {str(e)}")
        raise
```

### Helper Functions

```python
def get_user_tools(user_id: str, toolkits: List[str]):
    """Extract available tools for a user"""
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    composio_tools = composio.tools.get(
        user_id=user_id,
        toolkits=toolkits,
        limit=100
    )
    return composio_tools


def merge_execution_context(execution_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge data from execution history for context accumulation"""
    merged_data = {}
    for step in execution_history:
        if step.get("summary") and step["summary"].get("data_extracted"):
            merged_data.update(step["summary"]["data_extracted"])
    return merged_data
```

## Pydantic Models for Structured Outputs

One of the key innovations of this pattern is using Pydantic models for every LLM interaction, ensuring type safety and automatic validation:

```python
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Phase 1: Classification
class FlowNeeded(BaseModel):
    tool_calls_needed: bool = Field(
        description="Whether automated tool execution is required"
    )
    reasoning: str = Field(
        description="Explanation for the decision"
    )

# Phase 2: Final State Definition
class FinalState(BaseModel):
    state_name: str = Field(
        description="Short name for the goal state"
    )
    description: str = Field(
        description="Detailed description of what success looks like"
    )
    completion_criteria: List[str] = Field(
        description="Specific conditions that must all be met"
    )

# Phase 3: Tool Flow Planning
class ToolStep(BaseModel):
    purpose: str = Field(
        description="What this step accomplishes"
    )
    tools_needed: List[str] = Field(
        description="Composio tool names required for this step"
    )
    depends_on: Optional[List[int]] = Field(
        default=None,
        description="Indices of steps that must complete first"
    )

class ToolFlow(BaseModel):
    steps: List[ToolStep] = Field(
        description="Ordered list of execution steps"
    )
    estimated_duration: Optional[int] = Field(
        default=None,
        description="Estimated execution time in seconds"
    )

# Phase 4c: Execution Summary
class ExecutionSummary(BaseModel):
    summary: str = Field(
        description="Concise summary of what was accomplished in this step"
    )
    data_extracted: Dict[str, Any] = Field(
        description="Structured data extracted from tool results"
    )
    next_steps: Optional[List[str]] = Field(
        default=None,
        description="Suggested next actions based on results"
    )

# Phase 5: State Validation
class FinalStateCheck(BaseModel):
    is_reached: bool = Field(
        description="Whether all completion criteria are satisfied"
    )
    reasoning: str = Field(
        description="Explanation of validation decision"
    )
    missing_criteria: Optional[List[str]] = Field(
        default=None,
        description="Criteria not yet met (if is_reached=False)"
    )
```

**Benefits of Pydantic Integration:**

1. **Type Safety**: Full IDE autocomplete and static type checking
2. **Automatic Validation**: Pydantic validates all outputs against schema
3. **Self-Correction**: LLM automatically retries on validation errors
4. **Reduced Parsing Errors**: No manual JSON parsing and error handling
5. **Documentation**: Field descriptions serve as LLM instructions
6. **Consistency**: Guaranteed structure across all phases

**Integration with OpenAI Responses API:**

The [[openai-responses-api]] natively supports Pydantic models via the `response_format` parameter:

```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Does this email need automation?"}
    ],
    response_format=FlowNeeded  # Pass Pydantic model directly
)

# Response is automatically validated and parsed
flow_needed = response.choices[0].message.parsed  # FlowNeeded instance
```

## Composio Integration

[[composio|Composio]] provides the tool integration layer that abstracts away individual API complexity:

### Fetching User Tools

```python
from composio import Composio
import os

def get_user_tools(user_id: str, toolkits: List[str]):
    """
    Fetch authenticated tools for a specific user

    Args:
        user_id: User's email or identifier
        toolkits: List of toolkit names (e.g., ["gmail", "googlecalendar"])

    Returns:
        List of Composio tool definitions compatible with OpenAI function calling
    """
    composio = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))
    composio_tools = composio.tools.get(
        user_id=user_id,
        toolkits=toolkits,
        limit=100
    )
    return composio_tools
```

### Authentication Management

Composio handles authentication per user:
- Each user authenticates once via OAuth or API keys
- Composio stores credentials securely
- All tool calls execute with user's permissions
- No need to manage individual API tokens

### Tool Execution

```python
composio_client = Composio(api_key=os.getenv("COMPOSIO_API_KEY"))

# OpenAI returns tool_calls in response
execution_result = composio_client.provider.handle_tool_calls(
    response=response_with_tools,  # OpenAI response object
    user_id="user@example.com"     # Execute as this user
)
```

**What `handle_tool_calls()` does:**
1. Extracts `tool_calls` from OpenAI response
2. Maps each tool call to real API endpoint (Gmail, Calendar, etc.)
3. Authenticates as the specified user
4. Executes API calls with proper parameters
5. Handles errors and retries
6. Returns structured results

### Toolkit Whitelist Pattern

For security, filter allowed tools before execution:

```python
# Define which tools each toolkit can use
toolkit_whitelist = {
    "gmail": ["GMAIL_CREATE_DRAFT", "GMAIL_SEND_EMAIL"],
    "googlecalendar": ["GOOGLECALENDAR_CREATE_EVENT", "GOOGLECALENDAR_FIND_FREE_TIME"]
}

# Filter tools to only whitelisted ones
toolkits = [
    toolkit for toolkit in toolkits
    if toolkit.get("function", {}).get("name", "") in toolkit_whitelist
]
```

**Why Whitelist?**
- Prevent unauthorized actions (e.g., deleting emails)
- Comply with security policies
- Limit scope of automation
- Enable gradual rollout of capabilities

### Example Toolkits

Composio supports 250+ integrations across categories:

**Communication:**
- Gmail: Draft, send, search, label emails
- Slack: Post messages, create channels, manage users
- Microsoft Teams: Send messages, schedule meetings

**Productivity:**
- Google Calendar: Create events, check availability, send invites
- Notion: Create pages, update databases, search content
- Asana: Create tasks, update projects, assign work

**Development:**
- GitHub: Create issues, review PRs, manage repos
- Jira: Create tickets, update statuses, assign tasks
- Linear: Create issues, update workflows

**CRM:**
- HubSpot: Create contacts, log activities, update deals
- Salesforce: Manage leads, update opportunities

See [[composio]] for complete list and setup instructions.

## OpenAI Responses API Integration

The [[openai-responses-api]] is the foundation for tool calling in this pattern:

### Why Responses API Over Chat Completions?

**Responses API** (`/v1/responses`):
- Designed for agentic workflows with tools
- Native support for Pydantic structured outputs
- Stateless with optional state management
- Optimized for tool execution patterns
- OpenAI's "future direction" for agents

**Chat Completions** (`/v1/chat/completions`):
- Simple text generation
- Function calling requires client-side execution
- Better for basic conversational AI

### Tool Calling Example

```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Pass Composio tools to OpenAI
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are an email assistant."},
        {"role": "user", "content": "Schedule a meeting for next Tuesday at 2pm"}
    ],
    tools=composio_tools,  # Composio tool definitions
    response_format=ToolCallResponse  # Optional: Pydantic model for structure
)

# Response contains tool_calls array
if response.choices[0].message.tool_calls:
    # Execute via Composio
    result = composio_client.provider.handle_tool_calls(
        response=response,
        user_id="user@example.com"
    )
```

### Structured Outputs with Pydantic

```python
response = client.responses.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Has the meeting been scheduled successfully?"}
    ],
    response_format=FinalStateCheck  # Pydantic model
)

# Automatic parsing and validation
state_check = response.choices[0].message.parsed  # FinalStateCheck instance
print(state_check.is_reached)  # True/False
print(state_check.reasoning)   # Explanation string
```

**Benefits:**
- No manual JSON parsing
- Type-safe access to response fields
- Automatic retry if LLM returns invalid format
- Clear error messages for validation failures

See [[openai-responses-api]] for detailed API documentation and best practices.

## Observability with Langfuse

[[langfuse|Langfuse]] provides automatic tracing with a single decorator:

```python
from langfuse import observe

@observe()
def composio_state_driven_execute(...) -> dict:
    # All LLM calls, tool executions, and iterations
    # are automatically traced and logged
    ...
```

**What Gets Traced:**
- Each LLM call with prompts and responses
- Tool executions with inputs and outputs
- Iteration count and duration
- Final state checks and summaries
- Execution history with timestamps
- Errors and exceptions

**Langfuse Dashboard Shows:**
- Visual trace timeline
- Token usage per phase
- Latency breakdown
- Success/failure rates
- Cost tracking
- Debug information

**Benefits:**
- Debug failed workflows by replaying traces
- Optimize prompts based on token usage
- Monitor production performance
- Track costs per user/workflow
- Identify bottlenecks in execution

See [[langfuse]] for setup instructions and observability best practices.

## Real-World Use Case: Email Automation

Let's walk through a complete example: automating meeting scheduling from an email request.

### Input

```python
email_content = {
    "from": "john@example.com",
    "subject": "Meeting Request",
    "body": "Hi, can we schedule a 30-minute meeting next week to discuss Q1 planning? I'm available Tuesday-Thursday afternoons."
}

thread_context = {
    "previous_emails": [],
    "participants": ["john@example.com", "me@example.com"]
}

user_settings = {
    "agent_true_email": "me@example.com",
    "working_hours": "9am-5pm",
    "timezone": "America/Los_Angeles"
}

toolkits = ["gmail", "googlecalendar"]

toolkit_rules = {
    "gmail": "Always draft before sending. Use professional tone.",
    "googlecalendar": "Respect working hours. Add Google Meet link automatically."
}

campaign_rules = {
    "meeting_requests": "Respond within 1 hour. Propose 2-3 options."
}

toolkit_whitelist = {
    "GMAIL_CREATE_DRAFT": ["gmail"],
    "GMAIL_SEND_EMAIL": ["gmail"],
    "GOOGLECALENDAR_FIND_FREE_TIME": ["googlecalendar"],
    "GOOGLECALENDAR_CREATE_EVENT": ["googlecalendar"]
}
```

### Execution Flow

**Phase 1: Classification**
```python
FlowNeeded(
    tool_calls_needed=True,
    reasoning="Email requests meeting scheduling requiring calendar access and response"
)
```

**Phase 2: Final State**
```python
FinalState(
    state_name="meeting_scheduled_and_confirmed",
    description="Meeting event created, invitation sent, and confirmation email dispatched",
    completion_criteria=[
        "Calendar checked for availability",
        "Meeting event created in calendar",
        "Email response sent with meeting details",
        "Confirmation received from calendar system"
    ]
)
```

**Phase 3: Tool Flow**
```python
ToolFlow(
    steps=[
        ToolStep(
            purpose="Check calendar for Tuesday-Thursday afternoon availability",
            tools_needed=["GOOGLECALENDAR_FIND_FREE_TIME"],
            depends_on=None
        ),
        ToolStep(
            purpose="Create calendar event at available time",
            tools_needed=["GOOGLECALENDAR_CREATE_EVENT"],
            depends_on=[0]
        ),
        ToolStep(
            purpose="Draft and send email response with meeting details",
            tools_needed=["GMAIL_CREATE_DRAFT", "GMAIL_SEND_EMAIL"],
            depends_on=[1]
        )
    ],
    estimated_duration=25
)
```

**Phase 4: Iteration 1**

*4a. Determine Tools:*
```json
{
  "tool_calls": [{
    "function": {
      "name": "GOOGLECALENDAR_FIND_FREE_TIME",
      "arguments": {
        "start_date": "2025-10-14",
        "end_date": "2025-10-16",
        "duration": 30,
        "time_range": "13:00-17:00"
      }
    }
  }]
}
```

*4b. Execute:*
```python
# Composio executes calendar API call
execution_result = {
    "available_slots": [
        "2025-10-14T14:00:00Z",
        "2025-10-15T13:30:00Z",
        "2025-10-16T15:00:00Z"
    ]
}
duration_ms = 1250
```

*4c. Summary:*
```python
ExecutionSummary(
    summary="Found 3 available 30-minute slots: Oct 14 at 2pm, Oct 15 at 1:30pm, Oct 16 at 3pm",
    data_extracted={
        "available_slots": [
            "2025-10-14T14:00:00Z",
            "2025-10-15T13:30:00Z",
            "2025-10-16T15:00:00Z"
        ]
    },
    next_steps=["Create calendar event", "Send confirmation email"]
)
```

*4d. Record:*
```python
execution_history = [{
    "step_id": {"purpose": "Check calendar availability"},
    "result": {...},
    "summary": {...},
    "timestamp": "2025-10-10T10:15:32Z",
    "duration_ms": 1250
}]
```

**Phase 5: Validation (Iteration 1)**
```python
FinalStateCheck(
    is_reached=False,
    reasoning="Calendar checked but event not created and email not sent",
    missing_criteria=[
        "Meeting event created in calendar",
        "Email response sent with meeting details",
        "Confirmation received from calendar system"
    ]
)
```
→ Continue to Iteration 2

**Phase 4: Iteration 2**

*4a. Determine Tools:*
```json
{
  "tool_calls": [{
    "function": {
      "name": "GOOGLECALENDAR_CREATE_EVENT",
      "arguments": {
        "title": "Q1 Planning Meeting",
        "start_time": "2025-10-14T14:00:00Z",
        "duration": 30,
        "attendees": ["john@example.com"],
        "add_meet_link": true
      }
    }
  }]
}
```

*4b. Execute:*
```python
execution_result = {
    "event_id": "evt_xyz789",
    "event_link": "https://calendar.google.com/event?eid=xyz789",
    "meet_link": "https://meet.google.com/abc-defg-hij",
    "status": "confirmed"
}
duration_ms = 2100
```

*4c. Summary:*
```python
ExecutionSummary(
    summary="Created calendar event for Oct 14 at 2pm with Google Meet link",
    data_extracted={
        "event_id": "evt_xyz789",
        "event_time": "2025-10-14T14:00:00Z",
        "meet_link": "https://meet.google.com/abc-defg-hij",
        "attendees": ["john@example.com"]
    },
    next_steps=["Send confirmation email with meeting details"]
)
```

**Phase 5: Validation (Iteration 2)**
```python
FinalStateCheck(
    is_reached=False,
    reasoning="Event created but confirmation email not sent yet",
    missing_criteria=[
        "Email response sent with meeting details",
    ]
)
```
→ Continue to Iteration 3

**Phase 4: Iteration 3**

*4a. Determine Tools:*
```json
{
  "tool_calls": [
    {
      "function": {
        "name": "GMAIL_CREATE_DRAFT",
        "arguments": {
          "to": "john@example.com",
          "subject": "Re: Meeting Request - Scheduled for Oct 14",
          "body": "Hi John,\n\nI've scheduled our 30-minute Q1 planning meeting for Tuesday, October 14th at 2:00 PM PT.\n\nMeeting details:\n- Date: Tuesday, Oct 14, 2025\n- Time: 2:00 PM - 2:30 PM PT\n- Google Meet: https://meet.google.com/abc-defg-hij\n\nLooking forward to our discussion!\n\nBest regards"
        }
      }
    },
    {
      "function": {
        "name": "GMAIL_SEND_EMAIL",
        "arguments": {
          "draft_id": "draft_123"
        }
      }
    }
  ]
}
```

*4b. Execute:*
```python
execution_result = {
    "draft_created": True,
    "draft_id": "draft_123",
    "email_sent": True,
    "message_id": "msg_456"
}
duration_ms = 1800
```

*4c. Summary:*
```python
ExecutionSummary(
    summary="Sent confirmation email to john@example.com with meeting details and Google Meet link",
    data_extracted={
        "email_sent": True,
        "message_id": "msg_456",
        "recipient": "john@example.com"
    },
    next_steps=None  # No further actions needed
)
```

**Phase 5: Validation (Iteration 3)**
```python
FinalStateCheck(
    is_reached=True,
    reasoning="All criteria met: calendar checked, event created with confirmation, email sent with details",
    missing_criteria=None
)
```
→ Exit iteration loop (success!)

**Phase 6: Final Summary**
```
Step 1: Found 3 available 30-minute slots: Oct 14 at 2pm, Oct 15 at 1:30pm, Oct 16 at 3pm
Step 2: Created calendar event for Oct 14 at 2pm with Google Meet link
Step 3: Sent confirmation email to john@example.com with meeting details and Google Meet link
```

### Final Output

```python
{
    "success": True,
    "final_state": FinalState(...),
    "tool_flow_plan": ToolFlow(...),
    "execution_history": [
        {"step_id": {...}, "summary": {...}, "timestamp": "...", "duration_ms": 1250},
        {"step_id": {...}, "summary": {...}, "timestamp": "...", "duration_ms": 2100},
        {"step_id": {...}, "summary": {...}, "timestamp": "...", "duration_ms": 1800}
    ],
    "iterations": 3,
    "outcome_summary": "Step 1: Found 3 available slots...\nStep 2: Created event...\nStep 3: Sent email..."
}
```

**Total Execution Time**: ~5.2 seconds
**LLM Calls**: ~9 (classify, state, plan, 3x determine tools, 3x summarize, 3x validate)
**Tool Executions**: 4 (find slots, create event, create draft, send email)
**Result**: Fully automated meeting scheduling from email to confirmed calendar event

## State Management Strategy

The pattern maintains state through **execution history** - an array of step records:

```python
execution_history = [
    {
        "step_id": {"purpose": "Check availability"},
        "result": {...},  # Raw Composio output
        "summary": ExecutionSummary(...),  # Compressed context
        "timestamp": "2025-10-10T10:15:32Z",
        "duration_ms": 1250,
        "after_execution_summary": False  # Final state reached?
    },
    # ... more steps
]
```

### Context Accumulation

As iterations progress, data accumulates via summary chaining:

```python
def merge_execution_context(execution_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge extracted data from all steps"""
    merged_data = {}
    for step in execution_history:
        if step.get("summary") and step["summary"].get("data_extracted"):
            merged_data.update(step["summary"]["data_extracted"])
    return merged_data
```

**Example merged context after 3 iterations:**
```python
{
    "available_slots": ["2025-10-14T14:00:00Z", ...],
    "event_id": "evt_xyz789",
    "event_time": "2025-10-14T14:00:00Z",
    "meet_link": "https://meet.google.com/abc-defg-hij",
    "attendees": ["john@example.com"],
    "email_sent": True,
    "message_id": "msg_456",
    "recipient": "john@example.com"
}
```

### Summary Chaining

Each iteration's summary feeds into the next tool determination:

```
Iteration 1 Summary → Tool Determination 2 → Execution 2 → Iteration 2 Summary → Tool Determination 3 → ...
```

This creates a **compressed context window** - instead of passing full tool outputs (which can be verbose), only essential data is extracted and carried forward.

### Benefits of This Approach

1. **Context Efficiency**: Summaries prevent context window bloat
2. **Flexibility**: Easy to adapt based on intermediate results
3. **Debuggability**: Full history available for inspection
4. **Auditability**: Complete record of what happened and when
5. **Resumability**: Could checkpoint and resume from any step

## Context Engineering Integration

This pattern demonstrates several [[context-engineering|context engineering]] strategies:

### Write: Generating Compressed Summaries

Each iteration's `composio_summarize_execution()` implements the **Write** strategy:
- Compress verbose tool outputs into concise summaries
- Extract only relevant structured data
- Suggest logical next steps

**Benefit**: Prevents context window bloat as iterations accumulate.

### Select: Determining Next Tools

Phase 4a (`composio_determine_tools()`) implements the **Select** strategy:
- Choose which tools from the plan to execute next
- Prioritize based on dependencies and previous results
- Skip unnecessary steps when shortcuts available

**Benefit**: Dynamic execution paths adapt to actual results.

### Compress: Context Merging

The `merge_execution_context()` helper implements **Compress**:
- Merge extracted data from all steps
- Deduplicate redundant information
- Maintain only current state

**Benefit**: Accumulated context stays manageable.

### Isolate: Phase Separation

The 6-phase architecture implements **Isolate**:
- Each phase has clear input/output boundaries
- Planning (Phase 3) separated from execution (Phase 4)
- Validation (Phase 5) independent from execution

**Benefit**: Clear debugging, easy to modify individual phases.

## Comparison to Alternative Patterns

### vs ReAct Pattern

**ReAct** (Reasoning + Acting):
- Agent reasons about next action, acts, observes result, repeats
- No explicit planning phase
- More LLM calls (reason on every step)

**State-Driven Execution**:
- Explicit planning phase upfront
- Goal-driven iteration with validation
- Fewer LLM calls (plan once, execute, validate)

**When to use State-Driven**: Complex multi-step workflows with clear goals
**When to use ReAct**: Exploratory tasks, simpler workflows, research-oriented agents

### vs LangGraph StateGraph

**[[langgraph|LangGraph]] StateGraph**:
- Graph-based workflow with nodes and edges
- Compile-time graph definition
- Rich state management with reducers
- Built-in checkpointing and human-in-the-loop

**State-Driven Execution**:
- Linear iterative workflow
- Runtime plan generation
- Simpler execution history
- Lightweight implementation

**When to use State-Driven**: Linear workflows, simpler state, Python-only
**When to use LangGraph**: Complex graphs, conditional branching, need checkpointing, multi-language

### vs Single-Shot Tool Calling

**Single-Shot**:
- One LLM call with all tools
- No iteration
- No goal validation

**State-Driven Execution**:
- Multiple iterations
- Continuous goal validation
- Can recover from failures

**When to use State-Driven**: Multi-step goals, need validation, handle failures
**When to use Single-Shot**: Simple one-off tasks, independent tools

## Benefits

### 1. Explicit Goal Validation

Unlike patterns that "run until tools stop," this defines success criteria upfront and validates continuously.

**Impact**: Ensures tasks actually complete, not just stop executing.

### 2. Type Safety with Pydantic

Every LLM output is validated against Pydantic models, catching errors before they propagate.

**Impact**: Fewer runtime errors, more reliable execution, better debugging.

### 3. Automatic Iteration

The loop handles retries and multi-step flows without manual orchestration.

**Impact**: Reduces boilerplate code, handles complex flows simply.

### 4. Tool Abstraction via Composio

Individual API complexity (auth, endpoints, parameters) abstracted away.

**Impact**: Focus on business logic, not integration details. Easy to add new tools.

### 5. Built-in Observability

Langfuse tracing provides automatic monitoring without instrumentation code.

**Impact**: Debug production issues, optimize prompts, track costs.

### 6. Safety Mechanisms

Max iterations, toolkit whitelisting, structured outputs prevent common failure modes.

**Impact**: Production-ready with security and reliability built in.

### 7. Execution History

Complete audit trail of what happened, when, and why.

**Impact**: Debugging, compliance, replay, analysis, optimization.

### 8. Context Efficiency

Summary chaining prevents context window bloat while maintaining necessary information.

**Impact**: Lower costs, faster execution, works with longer workflows.

### 9. Separation of Concerns

Planning, execution, and validation are distinct phases with clear boundaries.

**Impact**: Easy to modify, test, and extend individual phases.

### 10. Flexibility

Runtime plan generation adapts to actual tool results, not fixed workflows.

**Impact**: Handles edge cases, recovers from failures, more robust.

## Technologies Used

- **[[composio]]**: Tool integration platform with 250+ authenticated integrations for Gmail, Slack, GitHub, Calendar, Notion, CRM systems, and more. Handles authentication, API mapping, and reliable execution.

- **[[openai-responses-api]]**: Stateless API for agentic workflows with native Pydantic support, hosted tool execution, and optimized for multi-step agent patterns.

- **[[langfuse]]**: Open-source LLM observability platform providing automatic tracing, token usage tracking, cost analysis, and debugging dashboards.

- **Pydantic**: Python data validation library enabling type-safe structured outputs with automatic validation and self-correction.

- **Python Typing**: Type hints throughout for IDE support and static analysis.

## Related Patterns

- **[[multi-tool-agent]]**: Similar multi-tool coordination pattern with different orchestration approach

- **[[agentic-rag-workflow]]**: Iterative agent workflow for retrieval-augmented generation, demonstrates similar iteration patterns

- **[[langgraph]]**: Graph-based orchestration framework offering more complex state management and control flow options

- **[[openai-agents-sdk]]**: Higher-level Python SDK providing built-in handoffs, guardrails, and sessions on top of Responses API

- **Plan-and-Execute Pattern**: Architectural pattern from LangGraph research separating planning from execution phases

## Resources

**Pattern References:**
- [LangGraph Plan-and-Execute Tutorial](https://langchain-ai.github.io/langgraph/tutorials/plan-and-execute/plan-and-execute/) - Original pattern inspiration
- [LLM Agents State Management](https://aisc.substack.com/p/llm-agents-part-6-state-management) - State management best practices
- [Microsoft Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) - Enterprise agent patterns

**Technology Documentation:**
- [Composio Official Docs](https://docs.composio.dev/) - Tool integration setup
- [OpenAI Responses API Reference](https://platform.openai.com/docs/api-reference/responses) - API specification
- [Pydantic AI Documentation](https://ai.pydantic.dev/) - Structured outputs guide
- [Langfuse Documentation](https://langfuse.com/docs) - Observability setup

**Related Research:**
- [Teaching LangChain Agents Multi-Step Workflows](https://medium.com/@avigoldfinger/teaching-langchain-agents-to-plan-run-multi-step-multi-tool-workflows-82ac908fd56e) - Multi-step planning patterns
- [LangGraph State Machines in Production](https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4) - Production deployment guidance

---

## Changelog

- **2025-10-10**: Initial example created documenting state-driven execution pattern with Composio, OpenAI Responses API, Pydantic structured outputs, and Langfuse observability
