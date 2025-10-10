---
title: Context Compression & Pruning
type: concept
tags: [optimization, context, tokens, efficiency]
created: 2025-10-03
updated: 2025-10-10
---

# Context Compression & Pruning

## Definition

Context compression and pruning techniques reduce the number of tokens in an LLM's context window while retaining critical information, addressing context length limitations and reducing computational costs.

## Main Techniques

### 1. Dynamic Token Pruning: LazyLLM
- Developed by Apple Machine Learning Research
- Selectively computes key-value (KV) cache for important tokens
- Works in both prefilling and decoding stages
- Accelerated LLaMA 2 7B model's prefilling by **2.34x**
- Allows tokens pruned in previous steps to be reconsidered later

### 2. Prompt Compression: LLMLingua Series

**LLMLingua (EMNLP 2023)**:
- Uses small language model to identify and remove unimportant tokens
- Achieves up to **20x compression** with minimal performance loss
- Reduces system latency by **20-30%**

**LongLLMLingua (ACL 2024)**:
- Mitigates "lost in the middle" issue
- Improves RAG performance by up to **21.4%** using only **1/4 of tokens**

**LLMLingua-2 (ACL 2024)**:
- Trained via data distillation from GPT-4
- **3x-6x faster** than original LLMLingua
- Better handling of out-of-domain data

### 3. Sparse Attention
- Techniques like Longformer selectively focus on smaller set of tokens
- Enables models to scale to larger input sizes without overhead

### 4. Context Summarization
- Summarize conversation history or document content
- Trim older messages while preserving key information
- Prune unnecessary details from context

### 5. Chunking and Retrieval Augmentation
- Segment large documents into manageable chunks
- Retrieve only relevant chunks rather than entire documents
- Combines well with [[retrieval-augmented-generation|RAG]] systems

## Best Practices

- Choose technique based on use case (dynamic for real-time, static for batch)
- Evaluate compression-performance tradeoffs
- Use hybrid approaches combining summarization, pruning, and retrieval
- Test across different scenarios (out-of-domain data may need different strategies)
- Integrate with RAG for optimal results

## Performance Metrics

- **Compression Ratio**: 3x-20x depending on technique
- **Latency Reduction**: 20-30% improvement in generation time
- **Accuracy Maintenance**: Minimal performance loss with proper tuning
- **Token Efficiency**: Using 1/4 of tokens while maintaining or improving performance

## Complementary Approaches

While context compression reduces token usage by removing information, [[agentic-context-engineering|Agentic Context Engineering (ACE)]] takes the opposite approach: growing and refining context over time through structured delta updates. These approaches address different scenarios:

- **Compression**: When context exceeds model limits or cost constraints require reduction
- **ACE**: When accumulating domain knowledge improves performance and context limits allow growth

Both can be used together: ACE for growing valuable knowledge, compression for managing total size when context approaches limits.

## How It Relates

- **[[context-engineering]]**: Directly implements the "Compress" strategy
- **[[agentic-context-engineering]]**: Contrasting approach that grows rather than compresses context
- **[[retrieval-augmented-generation]]**: Works synergistically to optimize what enters the context window
- **[[observability-in-context]]**: Measure compression-quality tradeoffs

## Key Technologies

- [[langfuse]]: Monitor compression effectiveness
- [[langgraph]]: Orchestrate compression in agent workflows
- LLMLingua integrated into LlamaIndex

## Real-World Applications

- Long-context Q&A with multi-document question answering
- Chat systems maintaining conversation history within token limits
- RAG systems compressing retrieved documents
- Meeting summarization with long transcripts
- Legal/medical document processing

---

## Changelog

- **2025-10-10**: Added complementary approaches section comparing compression to [[agentic-context-engineering|ACE]]
- **2025-10-03**: Initial note created with 5 main techniques, performance metrics, and relationships
