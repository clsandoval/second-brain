---
title: Agentic RAG Workflow Example
type: example
tags: [rag, agent, workflow, langgraph]
created: 2025-10-03
updated: 2025-10-03
---

# Agentic RAG Workflow Example

## Overview

Example implementation of an agentic RAG system where an LLM agent autonomously decides when and how to retrieve information during content generation.

## Architecture

```
User Query → Agent (LangGraph)
              ↓
         Decision Point: Need retrieval?
              ↓
         Yes → Onyx RAG System
              ↓
         Retrieved Docs → Compression (LLMLingua)
              ↓
         Compressed Context → LLM Generation
              ↓
         Response → Evaluation (Langfuse)
```

## Key Components

### 1. Agent Orchestration ([[langgraph]])
- Stateful workflow managing retrieval decisions
- Multi-step reasoning process
- Error handling and retry logic

### 2. Data Retrieval ([[onyx]])
- Query multiple knowledge sources
- Hybrid search (BM25 + vector)
- Return top-k relevant documents

### 3. Context Compression ([[context-compression-pruning]])
- Apply LLMLingua to retrieved documents
- Compress to fit context window
- Maintain critical information

### 4. Observability ([[langfuse]])
- Track retrieval relevance scores
- Monitor compression ratios
- Evaluate response quality
- Cost tracking per query

## Workflow Steps

1. **Query Analysis**: Agent analyzes user query to determine if retrieval is needed
2. **Source Selection**: Agent selects appropriate knowledge sources from Onyx connectors
3. **Retrieval**: Execute hybrid search across selected sources
4. **Compression**: Apply compression to fit context window
5. **Generation**: LLM generates response using compressed context
6. **Evaluation**: Self-RAG pattern - agent evaluates relevance and quality
7. **Iteration**: If quality insufficient, retrieve additional information

## Context Engineering Strategies

- **[[context-engineering#Select]]**: RAG for choosing relevant documents
- **[[context-engineering#Compress]]**: LLMLingua for token optimization
- **[[context-engineering#Isolate]]**: Separate workspace for each retrieval step
- **[[context-engineering#Write]]**: Store conversation history in agent state

## Benefits

- Autonomous decision-making reduces manual intervention
- Dynamic retrieval only when needed (cost optimization)
- Self-correction through evaluation loop
- Full traceability through Langfuse

## Related Concepts

- [[retrieval-augmented-generation#Agentic RAG]]
- [[context-engineering]]
- [[tool-abstraction-portability#Agents]]

---

## Changelog

- **2025-10-03**: Initial example created with architecture and workflow steps
