---
date: 2025-10-10T00:00:00-07:00
planner: armor
topic: "State-Driven Tool Execution with Composio and OpenAI"
tags: [vault-planning, agents, composio, openai, pydantic, state-driven, workflow, tools]
status: ready_to_write
---

# Vault Notes Plan: State-Driven Tool Execution with Composio and OpenAI

## Research Summary

This plan documents a production-grade state-driven agent execution pattern that combines Composio's tool integration platform, OpenAI's Responses API, and Pydantic's structured output validation into a cohesive iterative workflow. The pattern addresses a fundamental challenge in agent development: executing complex multi-step tool flows with explicit goal validation and automatic iteration until completion criteria are met.

**Key Findings from Research:**

- **State-Driven Execution Pattern**: Modern agent frameworks (LangGraph, OpenAI Agents SDK, Claude Agent SDK) emphasize explicit state management over implicit prompt chains. This pattern defines a clear "final state" goal upfront and iteratively executes tools until that goal is achieved or max iterations are reached.

- **Plan-and-Execute Architecture**: Research from LangChain and Microsoft Azure AI patterns identifies this as superior to ReAct patterns for complex tasks, offering faster execution, lower costs, and better performance through explicit planning phases separated from execution phases.

- **Pydantic for Type Safety**: Pydantic AI framework documentation demonstrates how structured outputs with automatic validation enable LLMs to self-correct when tool calls fail validation, reducing errors and improving reliability.

- **Composio Integration Layer**: Composio provides a unified SDK for 250+ integrations with standardized function calling, authentication management, and reliable execution - abstracting away the complexity of managing individual tool APIs.

- **Existing Example Patterns**: Analysis of 5 existing vault examples revealed consistent documentation patterns: architecture diagrams, component breakdowns, implementation steps, technology links, and real-world use cases.

## Scope Decision

### Recommended Approach: Single Comprehensive Example Note

### Notes to Create:

**State-Driven Tool Execution with Composio and OpenAI** (`apps/vault/examples/state-driven-composio-workflow.md`)
- **Type**: example
- **Rationale**: This represents a unified workflow pattern demonstrating integration of three technologies (Composio, OpenAI Responses API, Pydantic) in a cohesive architecture. The 6-phase workflow (classify → define state → plan → execute → validate → summarize) forms an integrated pattern that should not be fragmented. The individual technologies already have their own tech notes; this example shows their practical integration in a production pattern.

**Why Not Multiple Notes:**
- Composio, OpenAI Responses API, and Pydantic already have dedicated technology notes in the vault
- The state-driven execution pattern is a single architectural approach, not multiple distinct concepts
- Splitting the workflow would break the narrative of how phases interconnect
- Matches existing example structures like `agentic-rag-workflow.md` and `multi-tool-agent.md` which demonstrate multi-technology integration

---

## Note: State-Driven Tool Execution with Composio and OpenAI

### File Location
`apps/vault/examples/state-driven-composio-workflow.md`

### Structure

1. **Overview**
   - What this pattern solves: multi-step tool execution with goal validation
   - Core concept: define desired end state, plan execution, iterate until achieved
   - When to use: complex tool flows requiring state validation and iteration
   - Brief mention of technologies used with wikilinks

2. **Architecture**
   - ASCII diagram showing the 6-phase workflow:
     - Phase 1: Classification (tool flow needed?)
     - Phase 2: Final State Definition (what's the goal?)
     - Phase 3: Tool Flow Planning (how to get there?)
     - Phase 4: Iterative Execution (execute tools step-by-step)
     - Phase 5: State Validation (goal reached?)
     - Phase 6: Summarization (what happened?)
   - Show iteration loop (Phase 4 → Phase 5 → Phase 4 until goal or max iterations)
   - Highlight where Pydantic models provide structure at each phase
   - Show Composio's role in Phase 4 execution

3. **Key Components**
   - Break down each of the 6 phases with subsections

   **3.1 Phase 1: Classification**
   - Purpose: Determine if tool execution is needed
   - Function: `composio_classify_flow_needed()`
   - Pydantic model: `FlowNeeded` with `tool_calls_needed: bool` and `reasoning: str`
   - Decision point: early exit if no tools needed

   **3.2 Phase 2: Final State Definition**
   - Purpose: Define the desired end state/outcome
   - Function: `composio_determine_final_state()`
   - Pydantic model: `FinalState` with `state_name`, `description`, `completion_criteria`
   - Example: "Email responded with calendar invite sent"

   **3.3 Phase 3: Tool Flow Planning**
   - Purpose: Create execution plan with tool dependencies
   - Function: `composio_create_tool_flow()`
   - Pydantic model: `ToolFlow` with `steps: List[ToolStep]`, `dependencies`, `estimated_duration`
   - Analogy to Plan-and-Execute pattern from LangGraph research

   **3.4 Phase 4: Iterative Execution**
   - Purpose: Execute tools step-by-step based on plan
   - Function: `composio_determine_tools()` → `composio_client.provider.handle_tool_calls()`
   - How Composio handles authentication, API mapping, execution
   - How OpenAI Responses API provides tool calls with structured outputs
   - Recording execution history with timestamps and duration

   **3.5 Phase 5: State Validation**
   - Purpose: Check if final state has been reached
   - Function: `composio_check_final_state()`
   - Pydantic model: `FinalStateCheck` with `is_reached: bool`, `reasoning: str`, `missing_criteria`
   - Iteration decision: continue or exit

   **3.6 Phase 6: Summarization**
   - Purpose: Generate summary of execution for context
   - Function: `composio_summarize_execution()`
   - Pydantic model: `ExecutionSummary` with `summary`, `data_extracted`, `next_steps`
   - How summaries feed into next iteration as context

4. **Implementation Pattern**
   - Show full implementation structure with code snippets
   - Main orchestration function: `composio_state_driven_execute()`
   - Setup phase: user tools fetching, whitelist filtering
   - Execution loop structure:
     ```python
     while not final_state_reached and iteration_count < max_iterations:
         # Determine next tools
         # Execute via Composio
         # Generate summary
         # Check final state
         # Record history
     ```
   - Safety mechanisms: max iterations (10), toolkit whitelisting
   - Context accumulation: merging data from execution history

5. **Pydantic Models for Structured Outputs**
   - Show example Pydantic model definitions for each phase:
     ```python
     class FlowNeeded(BaseModel):
         tool_calls_needed: bool
         reasoning: str

     class FinalState(BaseModel):
         state_name: str
         description: str
         completion_criteria: List[str]

     class ToolStep(BaseModel):
         purpose: str
         tools_needed: List[str]
         depends_on: Optional[List[int]]

     class ToolFlow(BaseModel):
         steps: List[ToolStep]
         estimated_duration: Optional[int]

     class FinalStateCheck(BaseModel):
         is_reached: bool
         reasoning: str
         missing_criteria: Optional[List[str]]

     class ExecutionSummary(BaseModel):
         summary: str
         data_extracted: Dict[str, Any]
         next_steps: Optional[List[str]]
     ```
   - How Pydantic provides type safety and automatic validation
   - How OpenAI Responses API natively supports Pydantic `response_format`
   - Benefits: self-correction, reduced parsing errors, IDE autocomplete

6. **Composio Integration**
   - Fetching user-specific tools: `composio.tools.get(user_id, toolkits, limit)`
   - Toolkit examples: Gmail, Slack, GitHub, Calendar
   - Authentication handling: unified auth per user
   - Tool execution: `handle_tool_calls(response, user_id)`
   - Whitelist pattern for security: filtering allowed tools
   - How Composio abstracts away individual API complexity

7. **OpenAI Responses API Integration**
   - Using `/v1/responses` endpoint for stateless tool calling
   - Passing tools in request: Composio tools format compatible with OpenAI
   - Structured outputs via Pydantic: `response_format` parameter
   - Why Responses API over Chat Completions: hosted tool execution capabilities
   - Link to [[openai-responses-api]] for detailed API documentation

8. **Observability with Langfuse**
   - `@observe()` decorator on main orchestration function
   - Automatic tracing of execution flow
   - Capturing iteration count, tool calls, summaries
   - Benefits for debugging and optimization
   - Link to [[langfuse]] for observability setup

9. **Real-World Use Case: Email Automation**
   - Scenario: Automated email response with calendar scheduling
   - Input: email content, thread context, user settings
   - Toolkit rules and campaign rules for customization
   - Workflow:
     1. Classify: Does this email need automated action?
     2. Define State: "Email responded with meeting scheduled"
     3. Plan: "Step 1: Draft reply, Step 2: Check calendar, Step 3: Send invite"
     4. Execute: Gmail and Calendar API calls via Composio
     5. Validate: Reply sent AND invite created AND recipient notified?
     6. Summarize: "Responded to meeting request from [name], scheduled for [time]"
   - How toolkit whitelisting ensures only authorized tools are used
   - Safety: max 10 iterations prevents infinite loops

10. **State Management Strategy**
    - Execution history as persistent state: array of step records
    - Each step record contains:
      - `step_id`: Current step from plan
      - `result`: Composio tool execution output
      - `summary`: Pydantic ExecutionSummary model
      - `timestamp`: ISO timestamp
      - `duration_ms`: Execution time
      - `after_execution_summary`: Final state check result
    - Context merging: accumulating extracted data across iterations
    - Summary chaining: previous step summary feeds into next tool determination
    - State flow visualization in architecture diagram

11. **Context Engineering Integration**
    - How this pattern relates to [[context-engineering]] strategies:
      - **Write**: Generating structured summaries at each step (compression)
      - **Select**: Determining which tools to call next (relevance)
      - **Compress**: Accumulating only extracted data, not full outputs
      - **Isolate**: Each iteration operates on current context + history summary
    - Comparison to alternative patterns:
      - vs ReAct: More explicit planning, fewer LLM calls
      - vs LangGraph StateGraph: More lightweight, no graph compilation needed
      - vs single-shot tool calling: Iterative with validation
    - When to use this pattern vs alternatives

12. **Benefits**
    - **Explicit Goal Validation**: Clear success criteria, not just "run until tools stop"
    - **Type Safety**: Pydantic models catch errors before execution
    - **Automatic Iteration**: No manual loop management
    - **Tool Abstraction**: Composio handles auth and API complexity
    - **Observability**: Built-in tracing with Langfuse
    - **Safety**: Max iterations, whitelist filtering, structured outputs
    - **Flexibility**: Easy to add new phases or modify flow
    - **Debuggability**: Execution history provides full audit trail
    - **Context Efficiency**: Summaries prevent context bloat

13. **Technologies Used**
    - [[composio]]: Tool integration platform with 250+ integrations
    - [[openai-responses-api]]: Stateless API for agentic workflows with hosted tools
    - [[langfuse]]: Open-source observability and tracing for LLM applications
    - **Pydantic**: Data validation and structured outputs (note: consider creating tech note)
    - **Python typing**: Type hints for all function signatures

14. **Related Patterns**
    - [[multi-tool-agent]]: Similar multi-tool coordination pattern
    - [[agentic-rag-workflow]]: Another example of iterative agent workflow
    - [[langgraph]]: Alternative graph-based orchestration approach
    - [[openai-agents-sdk]]: Higher-level abstractions for similar patterns
    - **Plan-and-Execute**: Pattern from LangGraph research (consider creating concept note)

15. **Changelog**
    - **2025-10-10**: Initial example created documenting state-driven execution pattern with Composio, OpenAI, and Pydantic

### Key Content Points

**Critical Details to Include:**

- **Complete 6-phase workflow explanation** with clear phase transitions
- **Code snippets showing**:
  - Main orchestration function signature and structure
  - Execution loop with iteration logic
  - Example Pydantic model definitions for each phase
  - Composio tool fetching and execution calls
  - Execution history recording structure
  - Context merging helper function
- **Architecture diagram** showing:
  - Flow from input → classification → state definition → planning → execution loop → output
  - Iteration cycle between execution and validation
  - Where each technology (Composio, OpenAI, Pydantic) is used
- **Real code examples** from the provided implementation:
  - `get_user_tools()` function
  - `composio_state_driven_execute()` main function structure
  - Execution history recording pattern
  - Summary generation and merging logic
- **Safety mechanisms**:
  - `max_iterations = 10` to prevent infinite loops
  - Toolkit whitelisting with `toolkit_whitelist` parameter
  - Early exit when `tool_calls_needed = False`
  - Error handling (try/except in main function)
- **Performance considerations**:
  - Duration tracking (`duration_ms` for each step)
  - Iteration count tracking for debugging
  - Context efficiency through summarization
- **Observability integration**:
  - `@observe()` decorator from Langfuse
  - Logging at key decision points
  - Full execution history for replay/debugging

**Concrete Examples**:

- **Email automation scenario** as primary use case:
  - Input: email content with meeting request
  - Toolkit: Gmail, Google Calendar
  - Final state: "Email responded with calendar invite sent"
  - Tool flow: Draft reply → Check availability → Create event → Send response
  - Iteration: If invite fails, retry with different time slot
  - Output: Execution history with timestamps and summaries

- **Pydantic model example** for Phase 2 (Final State Definition):
  ```python
  class FinalState(BaseModel):
      state_name: str = Field(description="Short name for the goal state")
      description: str = Field(description="Detailed description of what success looks like")
      completion_criteria: List[str] = Field(description="List of specific conditions that must be met")

  # Example output:
  # FinalState(
  #     state_name="email_responded_with_meeting",
  #     description="Email has been responded to with a meeting invite sent to the requester",
  #     completion_criteria=[
  #         "Reply email drafted and sent",
  #         "Calendar event created",
  #         "Event invitation sent to requester",
  #         "Confirmation received"
  #     ]
  # )
  ```

- **Tool flow example** from Phase 3:
  ```python
  class ToolFlow(BaseModel):
      steps: List[ToolStep]
      estimated_duration: Optional[int]

  # Example output:
  # ToolFlow(
  #     steps=[
  #         ToolStep(purpose="Draft meeting response", tools_needed=["GMAIL_CREATE_DRAFT"], depends_on=None),
  #         ToolStep(purpose="Check calendar availability", tools_needed=["GOOGLECALENDAR_FIND_FREE_TIME"], depends_on=[0]),
  #         ToolStep(purpose="Create calendar event", tools_needed=["GOOGLECALENDAR_CREATE_EVENT"], depends_on=[1]),
  #         ToolStep(purpose="Send email response", tools_needed=["GMAIL_SEND_EMAIL"], depends_on=[2])
  #     ],
  #     estimated_duration=30
  # )
  ```

- **Execution loop structure**:
  ```python
  iteration_count = 0
  max_iterations = 10
  final_state_reached = False
  summary = {}

  while not final_state_reached and iteration_count < max_iterations:
      # Determine next tools based on plan and previous summary
      response_with_tools = composio_determine_tools(
          tool_flow=tool_flow,
          previous_step=summary,
          final_state=final_state,
          # ... other params
      )

      # Execute via Composio with timing
      start_time = datetime.now()
      execution_result = composio_client.provider.handle_tool_calls(
          response=response_with_tools,
          user_id=user_id
      )
      duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)

      # Generate summary for context
      summary = composio_summarize_execution(
          tool_flow=tool_flow,
          execution_result=execution_result,
          step_purpose=current_step.get("purpose", ""),
          # ... other params
      )

      # Record in history
      execution_history.append({
          "step_id": current_step,
          "result": execution_result,
          "summary": summary,
          "timestamp": datetime.now().isoformat(),
          "duration_ms": duration_ms,
      })

      # Check if goal reached
      final_state_dict = composio_check_final_state(
          final_state_definition=final_state,
          execution_history=execution_history,
          latest_summary=summary,
          # ... other params
      )

      if final_state_dict["is_reached"]:
          final_state_reached = True

      iteration_count += 1
  ```

**Sources to Reference**:

- Composio documentation: https://composio.dev/
- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- Pydantic AI: https://ai.pydantic.dev/
- Langfuse observability: https://langfuse.com/
- LangGraph Plan-and-Execute: https://langchain-ai.github.io/langgraph/tutorials/plan-and-execute/
- State Management in LLM Agents: https://aisc.substack.com/p/llm-agents-part-6-state-management

### Relationships & Links

**Links to existing notes**:
- [[composio]] - Tool integration platform (existing tech note)
- [[openai-responses-api]] - Stateless agent API (existing tech note)
- [[langfuse]] - Observability platform (existing tech note)
- [[context-engineering]] - Core concept for context management strategies
- [[tool-abstraction-portability]] - Composio's role in abstracting tool APIs
- [[multi-tool-agent]] - Related example of multi-tool coordination
- [[agentic-rag-workflow]] - Related example of iterative agent workflow
- [[langgraph]] - Alternative graph-based orchestration approach
- [[openai-agents-sdk]] - Higher-level Python SDK for agent patterns

**New wikilinks to create** (mark as TODO if note doesn't exist):
- [[pydantic]] - TODO: Consider creating tech note for Pydantic (Python data validation library)
- [[plan-and-execute]] - TODO: Consider creating concept note for Plan-and-Execute pattern
- [[state-driven-execution]] - TODO: Consider creating concept note if this pattern becomes widely used

### Frontmatter

```yaml
title: State-Driven Tool Execution with Composio and OpenAI
type: example
tags: [agent, workflow, composio, openai, pydantic, tools, state-driven, iteration, observability, langfuse, multi-step, structured-outputs]
created: 2025-10-10
updated: 2025-10-10
```

### Success Criteria

- [x] Clear explanation of state-driven execution pattern
- [x] All 6 phases documented with code examples
- [x] Pydantic models shown for each phase with example outputs
- [x] Visual architecture diagram showing full workflow
- [x] Iterative execution loop clearly explained with code
- [x] Real-world use case (email automation) included with details
- [x] Safety mechanisms (max iterations, whitelisting) documented
- [x] All [[wikilinks]] point to existing notes or marked as TODOs
- [x] Observability integration (Langfuse) demonstrated
- [x] Execution history structure explained
- [x] Context merging strategy documented
- [x] Comparison to alternative patterns (ReAct, LangGraph)
- [x] Complete code snippets for implementation
- [x] Links to external documentation and resources

---

## Research References

**Official Documentation**:
- [Composio Official Website](https://composio.dev/)
- [Composio GitHub Repository](https://github.com/ComposioHQ/composio)
- [OpenAI Responses API Reference](https://platform.openai.com/docs/api-reference/responses)
- [OpenAI Platform - Agents Guide](https://platform.openai.com/docs/guides/agents)
- [Pydantic AI Documentation](https://ai.pydantic.dev/)
- [Langfuse Documentation](https://langfuse.com/)

**Research and Patterns**:
- [LangGraph Plan-and-Execute Tutorial](https://langchain-ai.github.io/langgraph/tutorials/plan-and-execute/plan-and-execute/)
- [LLM Agents State Management Guide](https://aisc.substack.com/p/llm-agents-part-6-state-management)
- [LangGraph State Machines in Production](https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4)
- [Microsoft Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

**Vault Research Documents**:
- `thoughts/shared/plans/vault_notes/composio.md` - Composio technology note plan
- `thoughts/shared/plans/vault_notes/openai-responses-api.md` - OpenAI Responses API note plan
- `thoughts/shared/plans/vault_notes/langgraph.md` - LangGraph orchestration note plan

**Existing Vault Examples** (for structure reference):
- `apps/vault/examples/agentic-rag-workflow.md` - Iterative workflow pattern
- `apps/vault/examples/multi-tool-agent.md` - Multi-tool coordination pattern
- `apps/vault/examples/context-compression-pipeline.md` - Multi-stage processing pattern

## Index Update Required

**Yes** - Add to `apps/vault/README.md` under the **Examples** section:

```markdown
### Examples

- [Agentic RAG Workflow](examples/agentic-rag-workflow.md) - Multi-stage retrieval and generation
- [Multi-Tool Agent](examples/multi-tool-agent.md) - Coordinating multiple tools in agent workflows
- [State-Driven Tool Execution with Composio and OpenAI](examples/state-driven-composio-workflow.md) - Iterative tool execution with goal validation using Composio, OpenAI Responses API, and Pydantic
- [Context Compression Pipeline](examples/context-compression-pipeline.md) - Multi-stage context optimization
- [Anthropic Context Pattern](examples/anthropic-context-pattern.md) - Claude-specific context management
- [TreeQuest](examples/treequest.md) - AB-MCTS implementation for tree search
```

## Additional Considerations

### Implementation Notes

1. **Helper Function Abstraction**: The example references helper functions like `composio_classify_flow_needed()`, `composio_determine_final_state()`, etc. The note should explain that these are LLM-powered functions that take inputs and return Pydantic models, but not show their full implementation (which would be too verbose). Instead, show their signatures, purposes, and expected outputs.

2. **Error Handling**: The provided code has a try/except block catching generic exceptions. The example should note this and suggest more granular error handling for production:
   - Composio API errors (rate limits, auth failures)
   - OpenAI API errors (token limits, model errors)
   - Pydantic validation errors (malformed outputs)
   - Tool execution errors (Gmail API failures, etc.)

3. **Async Considerations**: The provided code is synchronous. The note should mention that for production use, consider async variants:
   - `composio_client.provider.ahandle_tool_calls()` for async execution
   - Parallel tool execution when dependencies allow
   - Async LLM calls to reduce latency

4. **Cost Optimization**: Each iteration involves multiple LLM calls (determine tools, check state, summarize). Note should mention:
   - Cost tracking per iteration
   - Using smaller models (gpt-4o-mini) for simpler phases
   - Caching tool flow plan across iterations
   - Prompt optimization to reduce token usage

5. **Security Considerations**:
   - Toolkit whitelisting is critical for production
   - User-specific tool authentication via Composio
   - Input validation on email content and thread context
   - Rate limiting on tool execution
   - Audit logging of all tool calls

### Edge Cases to Document

1. **Max Iterations Reached**: What happens when loop exits without reaching final state?
   - Should return partial results with execution history
   - Log warning about incomplete execution
   - Consider alerting or human escalation

2. **Tool Execution Failures**: How to handle when Composio tool call fails?
   - Retry logic (not shown in provided code)
   - Fallback tools (use different calendar if primary fails)
   - Graceful degradation (send email even if calendar fails)

3. **Invalid Tool Flow Plans**: What if Phase 3 generates impossible plan?
   - Validation before execution loop starts
   - Replanning mechanism (not shown in current pattern)
   - Human review for complex workflows

4. **Context Window Limits**: What if execution history grows too large?
   - Summarization of older steps
   - Pruning irrelevant history
   - Sliding window of recent N steps

### Future Extensions

Patterns that could be added to this workflow in future iterations:

1. **Human-in-the-Loop**: Pause execution for approval before critical tools (send email, create event)
2. **Parallel Tool Execution**: Execute independent tools concurrently instead of sequentially
3. **Dynamic Replanning**: Adjust tool flow mid-execution based on unexpected results
4. **Multi-Agent Delegation**: Hand off subtasks to specialized agents
5. **Checkpointing**: Save state to resume long-running workflows
6. **A/B Testing**: Try multiple tool flow strategies and pick best result

### Dependencies for Note Creation

Before writing the actual vault note:
- Ensure [[composio]] tech note exists and is complete
- Ensure [[openai-responses-api]] tech note exists and is complete
- Ensure [[langfuse]] tech note exists and is complete
- Consider creating [[pydantic]] tech note if referenced frequently
- Verify [[context-engineering]] note has sections on Write, Select, Compress, Isolate

### Testing the Example

To validate the example works as documented:
1. Set up test environment with Composio API key, OpenAI API key, Langfuse keys
2. Create minimal working example with 2-3 tool workflow
3. Verify Pydantic models parse correctly
4. Check execution history structure matches documentation
5. Confirm iteration loop exits properly on success and max iterations
6. Test error handling for common failures
7. Verify observability integration captures traces

---

**Plan Status**: Ready to write

**Estimated Completion Time**: 2-3 hours for comprehensive example with all code snippets, diagrams, and explanations

**Writer Notes**:
- Emphasize the iterative loop and state validation as the core innovation
- Use the email automation example throughout to make it concrete
- Show Pydantic models prominently to demonstrate structured outputs
- Link liberally to related vault notes for deeper dives
- Keep code snippets focused on key patterns, not full implementations
- Include architecture diagram early to give readers mental model
