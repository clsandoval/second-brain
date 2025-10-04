---
title: AB-MCTS (Adaptive Branching Monte Carlo Tree Search)
type: concept
tags: [mcts, tree-search, inference-time-scaling, llm, optimization, reinforcement-learning, bayesian, thompson-sampling]
created: 2025-10-04
updated: 2025-10-04
---

# AB-MCTS (Adaptive Branching Monte Carlo Tree Search)

## Definition

**AB-MCTS** (Adaptive Branching Monte Carlo Tree Search) is a novel inference-time scaling algorithm developed by Sakana AI that enables large language models (LLMs) to perform effective trial-and-error problem-solving through adaptive tree search. Unlike traditional approaches that scale AI through larger models or more training data, AB-MCTS enhances performance at inference time by intelligently balancing two fundamental strategies:

- **"Going Wider"** (Exploration): Generating completely new solutions from scratch
- **"Going Deeper"** (Exploitation): Refining promising existing solutions through iteration

The core innovation is **adaptive branching**: the algorithm dynamically decides at each step whether to explore new solution candidates or refine existing ones, leveraging external feedback signals to guide the search process.

**Important nomenclature**: The "AB" stands for **"Adaptive Branching"**, not "Alpha-Beta" (the game tree pruning algorithm). This distinguishes it from traditional game-playing AI techniques.

## The Core Algorithm

### Problem Setup

AB-MCTS operates on tasks with the following structure:

- **Input**: Natural language prompt describing the task
- **Output**: Generated solution scored by an evaluation function
- **Score Range**: 0 to 1, where higher scores indicate better solutions
- **Objective**: Maximize solution quality within a computational budget (number of LLM API calls)

### Algorithm Structure

AB-MCTS operates through three main stages executed iteratively:

#### 1. Selection
Uses **Thompson Sampling** to probabilistically select which node (solution candidate) to explore next. The algorithm:
- Maintains Bayesian probability distributions over node values
- Samples from posterior predictive distributions
- Selects the action with the highest sampled score

#### 2. Expansion
Based on the selected node, either:
- **Generate new solution** (width): Create a completely new candidate from scratch via the GEN node
- **Refine existing solution** (depth): Take an existing solution and improve it iteratively

#### 3. Score Backup
After evaluation:
- Updates probability distributions based on the received feedback score
- Propagates information through the search tree
- Refines estimates of node values for future selection decisions

### GEN Nodes: Enabling Unbounded Width

A critical innovation in AB-MCTS is the **GEN (generation) node**:

- Every node in the search tree has a GEN node as a child
- When selected during the selection step, the GEN node expands the parent by adding a new child
- This enables **unbounded width exploration**: the tree can grow arbitrarily wide based on feedback
- Unlike standard MCTS with fixed branching factors, AB-MCTS adapts the tree structure dynamically

### Thompson Sampling: Why Not UCT?

Traditional MCTS uses **UCT (Upper Confidence bounds applied to Trees)** for node selection. AB-MCTS replaces this with **Thompson Sampling** for several critical reasons:

1. **GEN Node Compatibility**: UCT requires child nodes to compute confidence bounds. GEN nodes by definition don't have children yet, making UCT inapplicable.

2. **Parallel Expansion**: Thompson Sampling naturally supports parallel exploration by sampling multiple actions simultaneously without conflicts.

3. **Bayesian Framework**: Maintains full probability distributions over action values rather than point estimates, providing richer information for decision-making.

4. **Theoretical Properties**: Research has shown Thompson Sampling can achieve better regret bounds than UCT in certain contexts, particularly for online planning in Markov decision processes.

The algorithm models score distributions using Bayesian approaches and updates posterior beliefs with each evaluation, enabling principled uncertainty quantification and exploration-exploitation trade-offs.

## Algorithm Variants

AB-MCTS has two main implementation variants, each with different statistical modeling approaches:

### AB-MCTS-M (Mixed Model)

Uses a **Bayesian mixed-effects model** with random intercepts:

- Captures variance from both initial generation and refinement processes
- Treats each node as a "group" with its own random effect
- The GEN node is modeled as a new group without direct observations
- Infers the group-level intercept from the posterior distribution
- **Best for**: Tasks where generation and refinement have different characteristics

### AB-MCTS-A (Node Aggregation)

Introduces an explicit **CONT (continuation) node** for ongoing refinement:

- Aggregates all refinement child nodes under a single CONT node
- Two sub-variants based on prior distribution:
  - **Gaussian**: Uses Normal-inverse-χ² prior for continuous score modeling
  - **Beta**: Uses Beta distribution prior for bounded [0,1] scores
- **Best for**: Tasks with clear separation between generation and continuation phases

**Performance note**: In benchmarks, AB-MCTS-A (Beta variant) showed strongest performance on Code Contest tasks, while both variants consistently outperformed baselines.

## Key Technical Innovations

### 1. Adaptive Branching vs Fixed Branching Factor

**Traditional MCTS**:
- Uses a fixed branching factor as a hyperparameter
- Tree structure predetermined regardless of problem characteristics
- Can over-explore in some areas, under-explore in others

**AB-MCTS**:
- Branching factor emerges from Thompson Sampling and feedback
- Tree grows adaptively based on solution quality signals
- Automatically balances width and depth based on what's working

### 2. Thompson Sampling for Parallel Expansion

The use of Thompson Sampling enables:
- Multiple nodes can be selected and expanded in parallel
- No conflicts between concurrent explorations
- Natural load balancing across available computational resources
- Efficient use of API rate limits when using multiple LLM providers

### 3. Integration of External Feedback Signals

AB-MCTS bridges a fundamental gap in LLM inference:
- **Repeated sampling**: Generates diverse solutions but doesn't learn from feedback
- **Sequential refinement**: Learns from feedback but can get stuck in local optima
- **AB-MCTS**: Combines both approaches, using feedback to decide when to explore vs exploit

The algorithm can incorporate any evaluation signal:
- Unit test pass rates for code generation
- Correctness checks for mathematical reasoning
- Human preferences or reward models
- Domain-specific metrics

### 4. Unified Framework

AB-MCTS unifies three previously separate techniques:
- **Response diversity** from LLM sampling
- **Multi-turn refinement** from iterative prompting
- **Principled search** from MCTS algorithms

This creates a coherent framework where all three elements work together, guided by Thompson Sampling's probabilistic decision-making.

## How It Relates to Inference-Time Scaling

Inference-time scaling refers to improving AI performance by using more computation during inference (test time) rather than during training. AB-MCTS represents a sophisticated approach to this paradigm.

### Comparison with Repeated Sampling (Baseline)

**Repeated Sampling**:
- Generate N independent solutions
- Evaluate all solutions
- Select the best one
- **Limitation**: Doesn't use feedback to guide subsequent generations

**AB-MCTS Improvement**:
- Uses evaluation scores to focus computational budget
- Learns which solution directions are promising
- **Result**: 19.6% improvement on ARC-AGI-2 benchmark (single model)

### Comparison with Sequential Refinement

**Sequential Refinement**:
- Generate one solution
- Iteratively refine it based on feedback
- **Limitation**: Can get trapped in local optima, misses diverse approaches

**AB-MCTS Improvement**:
- Maintains multiple solution candidates simultaneously
- Can "restart" with new approaches when refinement plateaus
- **Result**: Consistent outperformance on Code Contest and MLE-Bench

### The "Wider or Deeper" Decision Framework

At each step, AB-MCTS faces a meta-decision:
- **Go Wider**: High uncertainty, need diverse approaches, or current solutions are weak
- **Go Deeper**: Promising solutions exist that could benefit from refinement

Thompson Sampling naturally implements this decision:
- Samples from uncertainty distributions
- High uncertainty → more likely to explore (width)
- High value → more likely to exploit (depth)
- Both factors balanced probabilistically

This connects to [[context-engineering]] principles of balancing exploration in prompt space with exploitation of effective patterns, and to [[research-agents]] which face similar explore-exploit trade-offs in hypothesis testing.

## Multi-Model Collaboration

A powerful extension of AB-MCTS is **Multi-LLM AB-MCTS**, where multiple frontier AI models collaborate on problem-solving:

### How Multiple LLMs Work Together

1. **Initial Phase**: Balanced usage of all available models (e.g., GPT-4o, Gemini-2.5-Pro, DeepSeek-R1)
2. **Learning Phase**: System observes which models generate better solutions for specific aspects
3. **Optimization Phase**: Dynamically allocates more computational budget to better-performing models
4. **Synergy Phase**: Models build on each other's outputs

### Dynamic Workload Allocation

The Thompson Sampling framework naturally extends to model selection:
- Each model has its own value distribution
- Better-performing models get sampled more frequently
- Poor performers don't get completely excluded (exploration)
- Adapts to problem characteristics in real-time

### Collective Intelligence Patterns

**Error-Driven Collaboration**: In documented cases:
- Model A generates an incorrect solution
- Model B analyzes the error and identifies the mistake
- Model C corrects it and obtains the right answer
- No individual model could solve it alone

This creates a form of "collective AI intelligence" where diverse models complement each other's strengths and compensate for weaknesses.

### Connections to Agentic Patterns

Multi-model AB-MCTS resembles patterns in [[multi-tool-agent]] and [[agentic-rag-workflow]]:
- Multiple specialized capabilities (models instead of tools)
- Dynamic routing based on performance
- Iterative refinement with feedback
- Ensemble decision-making

## Use Cases in AI Systems

### 1. Abstract Reasoning (ARC-AGI-2)

**Task**: Visual pattern recognition and logical reasoning problems designed to test general intelligence

**AB-MCTS Application**:
- Generate diverse solution hypotheses for visual patterns
- Refine promising approaches through iteration
- Leverage multiple models' different reasoning styles

**Results**: 30%+ success rate with multi-model AB-MCTS (vs 23% for repeated sampling baseline)

### 2. Competitive Programming

**Task**: Complex algorithmic problems from platforms like Codeforces, CodeChef

**AB-MCTS Application**:
- Generate different algorithmic approaches
- Refine implementations based on test case feedback
- Balance trying new algorithms vs debugging existing code

**Evaluation**: Unit tests, performance metrics, edge case handling

### 3. Machine Learning Engineering

**Task**: Kaggle competition-style ML tasks (data preprocessing, model training, hyperparameter optimization)

**AB-MCTS Application**:
- Explore different model architectures and approaches
- Refine hyperparameters and pipeline configurations
- Use validation metrics as feedback signals

**Benefits**: Scales with computational budget, finds non-obvious optimizations

### 4. Software Performance Optimization

**Task**: Reducing web service response times, improving system efficiency

**AB-MCTS Application**:
- Generate different optimization strategies (caching, algorithm changes, parallelization)
- Iteratively refine implementations
- Use performance benchmarks as evaluation signals

### 5. Agentic Workflows and Decision-Making

**Broader Applications**:
- **Planning**: Generate and refine action sequences
- **Tool Use**: Balance trying new tools vs refining tool usage patterns
- **Reasoning**: Explore different reasoning chains, refine promising ones
- **Research**: Generate hypotheses, refine experiments (see [[research-agents]])

The key requirement is a feedback signal that evaluates solution quality, making AB-MCTS broadly applicable across [[context-engineering]] scenarios.

## Performance Characteristics

### Empirical Results

#### ARC-AGI-2 Benchmark (Abstract Reasoning)
- **Repeated Sampling (o4-mini)**: 23% success rate
- **AB-MCTS (o4-mini)**: 27.5% success rate (+19.6% improvement)
- **Multi-LLM AB-MCTS**: >30% success rate (+30.4% improvement)

This represents "strong performance on the ARC-AGI-2 benchmark, outperforming individual o4-mini, Gemini-2.5-Pro, and DeepSeek-R1-0528 models by a large margin."

#### Code Contest Benchmark
- AB-MCTS-A (Beta) showed strongest performance
- Consistent improvements across all computational budgets (128-512 API calls)
- Outperformed both repeated sampling and standard MCTS

#### MLE-Bench (Machine Learning Engineering)
- Improved solution quality on ML tasks
- Benefits increased with larger generation budgets

### When AB-MCTS Works Best

**Ideal Conditions**:
1. **Reliable feedback signal**: Clear, informative evaluation metrics
2. **Benefit from refinement**: Solutions can be iteratively improved
3. **Value of exploration**: Multiple diverse approaches exist
4. **Computational budget**: Sufficient API calls to benefit from search

**Performance Scaling**:
- Improvements increase with computational budget
- More search iterations → better results
- Diminishing returns eventually, but curve is favorable

### Known Limitations

1. **Evaluator Dependency**: Requires a reliable score evaluator to provide feedback. Tasks without clear evaluation metrics are challenging.

2. **Limited Attempts**: Performance can decline when restricted to very few answer attempts, suggesting the algorithm benefits from exploration budget.

3. **Score Distribution Sensitivity**: Performance may vary depending on the characteristics of score distributions for different problem types.

4. **No Automatic Solution Selection**: In some scenarios, requires additional logic to automatically select best suggestions from the search tree.

5. **Overhead**: Has computational overhead compared to simple repeated sampling; only worthwhile when refinement and guided search provide value.

## Theoretical Foundation

### Monte Carlo Tree Search Background

MCTS gained prominence through **DeepMind's AlphaGo**, which used MCTS combined with deep neural networks to defeat world champions in Go. The core idea:
- Build a search tree incrementally
- Use random simulations to estimate node values
- Balance exploring new moves with exploiting promising ones

AB-MCTS extends this success from game-playing (discrete action spaces, clear win/loss) to natural language tasks (unbounded generation spaces, continuous feedback).

### Thompson Sampling vs UCT: Theoretical Properties

**UCT (Upper Confidence Bound for Trees)**:
- Uses deterministic confidence bounds: `value + C * sqrt(ln(N_parent) / N_child)`
- Guarantees logarithmic regret in finite action spaces
- Requires all actions to have been tried at least once

**Thompson Sampling**:
- Probabilistic action selection based on posterior sampling
- Handles infinite action spaces naturally (via GEN nodes)
- Better parallelization properties
- Research shows competitive or superior regret bounds in many settings

For AB-MCTS, Thompson Sampling is necessary because:
- The action space is unbounded (can always generate new solutions)
- GEN nodes don't have children, breaking UCT's confidence bound calculation
- Parallel LLM API calls are critical for efficiency

### Bayesian Posterior Modeling

Both AB-MCTS variants use Bayesian inference to model score distributions:

**AB-MCTS-M**: Mixed-effects model
- Prior: Normal-inverse-gamma distribution
- Likelihood: Gaussian observations with random intercepts
- Posterior: Updated via conjugate Bayesian inference

**AB-MCTS-A (Beta)**: Beta distribution
- Prior: Beta(α, β) distribution
- Likelihood: Binomial (for [0,1] scores)
- Posterior: Beta(α + successes, β + failures)

This Bayesian framework provides:
- Uncertainty quantification (variance in estimates)
- Natural exploration bonus (high uncertainty → more likely to explore)
- Principled belief updating with evidence

### Regret Bounds and Convergence

While full theoretical analysis is ongoing, AB-MCTS inherits properties from Thompson Sampling literature:
- **Regret**: The difference between optimal performance and algorithm performance
- Thompson Sampling has Õ(√T) regret bounds in many settings
- With enough iterations, AB-MCTS will find high-quality solutions with high probability

Open research questions remain about:
- Convergence rates in unbounded action spaces
- Impact of LLM stochasticity on theoretical guarantees
- Optimal prior selection for different problem classes

## Resources

### Research Papers
- **Primary Paper**: [Wider or Deeper? Scaling LLM Inference-Time Compute with Adaptive Branching Tree Search](https://arxiv.org/abs/2503.04412) (arXiv:2503.04412, March 2025, ICLR 2025 Workshop)
- **OpenReview**: [https://openreview.net/pdf?id=3HF6yogDEm](https://openreview.net/pdf?id=3HF6yogDEm)

### Official Documentation
- **Sakana AI Official Page**: [https://sakana.ai/ab-mcts/](https://sakana.ai/ab-mcts/)
- **Multi-LLM AB-MCTS**: [https://www.sakanaai.org/multi-llm-ab-mcts/](https://www.sakanaai.org/multi-llm-ab-mcts/)

### Implementation
- See [[treequest]] for open-source implementation details and code examples

### Related Concepts
- [[research-agents]] - Similar optimization and search strategies
- [[context-engineering]] - Prompt design for generation vs refinement
- [[agentic-rag-workflow]] - Search-based patterns in retrieval
- [[multi-tool-agent]] - Multi-step reasoning and decision-making

### Historical Context
- **AlphaGo/AlphaZero**: Original MCTS + deep learning success in game-playing
- **DNG-MCTS (2013)**: Earlier work on Thompson Sampling in MCTS for MDPs
- **O1 Model (OpenAI)**: Contemporary work on inference-time reasoning (different approach)

---

## Changelog
- **2025-10-04**: Initial creation with comprehensive technical details on AB-MCTS algorithm, variants, applications, and theoretical foundations
