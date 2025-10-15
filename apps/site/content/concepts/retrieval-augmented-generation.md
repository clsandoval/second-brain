---
title: Retrieval-Augmented Generation (RAG)
type: concept
tags: [rag, retrieval, llm, knowledge-base]
created: 2025-10-03
updated: 2025-10-03
aliases: [RAG]
---

# Retrieval-Augmented Generation (RAG)

## Definition

RAG is the process of optimizing LLM output by referencing an authoritative knowledge base outside of training data sources before generating a response. It enhances text generation by incorporating real-time data retrieval during the generation process.

## Core Architecture Components

1. **External Data Source**: Documents, databases, APIs
2. **Information Retrieval System**: Query processing and matching
3. **Vector Database**: Stores embeddings for semantic search
4. **Large Language Model (LLM)**: Generates responses using retrieved context

## How RAG Works

1. Convert external data into vector representations (embeddings)
2. Convert user query into vector format
3. Perform relevancy search in vector database
4. Retrieve most relevant information
5. Augment LLM prompt with retrieved context
6. Generate response using both retrieved data and LLM's training

## 8 Key RAG Architecture Patterns

1. **Simple RAG**: Basic retrieval from static database
2. **Simple RAG with Memory**: Adds context retention across interactions
3. **Branched RAG**: Selects most relevant data source based on query
4. **HyDe**: Generates hypothetical document before retrieval
5. **Adaptive RAG**: Dynamically adjusts retrieval strategy
6. **Corrective RAG (CRAG)**: Self-reflection to evaluate relevance
7. **Self-RAG**: Autonomously generates retrieval queries during generation
8. **Agentic RAG**: LLM acts as agent deciding which tools to use

## Notable 2024 Developments

- **GraphRAG**: Uses knowledge graphs for better context understanding (Microsoft)
- **Streaming RAG**: Works with continuously updated data streams in real time
- **LongRAG**: Handles lengthy documents more effectively

## Core Benefits

- Cost-effective implementation (no model retraining)
- Access to current information
- Enhanced user trust through source attribution
- Developer control over AI responses
- Prevents hallucinations by grounding in factual data

## How It Relates

- **[[context-engineering]]**: RAG implements the "Select" strategy for choosing external information
- **[[context-compression-pruning]]**: Advanced RAG patterns incorporate compression through reranking
- **[[observability-in-context]]**: Monitor retrieval quality and relevance scores

## Key Technologies

- [[onyx]]: 40+ enterprise connectors for RAG data sources
- [[langfuse]]: Monitor RAG performance and retrieval relevance
- [[langgraph]]: Orchestrate complex agentic RAG workflows
- Vector databases: Faiss, Pinecone, Weaviate

## Real-World Applications

- Customer support with up-to-date product information
- Enterprise search across company data
- Automated literature review and synthesis
- Fact-checked content generation with citations
- Domain-specific Q&A with source attribution

---

## Changelog

- **2025-10-03**: Initial note created with 8 architecture patterns, core components, and relationships
