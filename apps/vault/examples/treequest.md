---
title: TreeQuest Framework
type: example
tags: [ab-mcts, tree-search, implementation, open-source, sakana-ai, inference-time-scaling, multi-model]
created: 2025-10-04
updated: 2025-10-04
---

# TreeQuest Framework

## Overview

**TreeQuest** is the open-source implementation of [[ab-mcts]] (Adaptive Branching Monte Carlo Tree Search) developed and released by Sakana AI. It provides a production-ready framework for implementing inference-time scaling algorithms that enable large language models to perform adaptive tree search and trial-and-error problem-solving.

**Key Characteristics**:
- **License**: Apache 2.0 (commercial use permitted)
- **Language**: Python 3.11+
- **Package**: Available via pip/uv as `treequest`
- **Repository**: [github.com/SakanaAI/treequest](https://github.com/SakanaAI/treequest)

TreeQuest implements both AB-MCTS-M (Mixed Model) and AB-MCTS-A (Node Aggregation) variants, allowing users to choose the statistical approach that best fits their use case. The framework handles the complex tree search logic, Bayesian inference, and Thompson Sampling, letting developers focus on defining generation functions and evaluation metrics.

## Architecture & Components

### Core Package Structure

```
treequest/
├── algorithms/
│   ├── abmcts_m.py      # Mixed-effects model variant
│   ├── abmcts_a.py      # Node aggregation variants (Gaussian/Beta)
│   └── base.py          # Base algorithm interface
├── tree/
│   ├── nodes.py         # Node types (Action, GEN, CONT)
│   ├── state.py         # Tree state management
│   └── operations.py    # Tree manipulation operations
├── sampling/
│   ├── thompson.py      # Thompson Sampling implementation
│   └── distributions.py # Bayesian posterior distributions
└── evaluation/
    └── scoring.py       # Score tracking and updates
```

### Key Components

#### 1. Algorithm Implementations

**ABMCTS-M (Mixed Model)**:
```python
import treequest as tq

algo = tq.ABMCTSM()  # Mixed-effects Bayesian model
```
- Uses Bayesian mixed-effects model with random intercepts
- Best for tasks where generation and refinement have different characteristics

**ABMCTS-A (Node Aggregation)**:
```python
algo = tq.ABMCTSA()  # Node aggregation with Beta prior (default)
algo = tq.ABMCTSA(prior='gaussian')  # Gaussian prior variant
```
- Aggregates refinement nodes under CONT node
- Beta prior for bounded [0,1] scores
- Gaussian prior for unbounded continuous scores

#### 2. Search Tree Data Structures

**Node Types**:
- **Action Nodes**: Represent generated solutions or refinements
- **GEN Nodes**: Special nodes that enable width expansion (generating new solutions)
- **CONT Nodes** (AB-MCTS-A only): Aggregate all refinement attempts

**Tree State**:
```python
search_tree = algo.init_tree()  # Initialize empty tree
# Tree maintains:
# - Node hierarchy and relationships
# - Score observations for each node
# - Posterior distributions for Thompson Sampling
# - Current selection path
```

#### 3. Integration Points

Users must provide:

**Generation Function**:
```python
def generate(parent_state=None):
    """
    Generate a new solution or refine existing one.

    Args:
        parent_state: None for new generation, existing state for refinement

    Returns:
        (new_state, score): New solution state and its evaluation score [0, 1]
    """
    if parent_state is None:
        # Generate from scratch (width expansion)
        new_state = llm.generate(prompt)
    else:
        # Refine existing solution (depth expansion)
        new_state = llm.refine(parent_state)

    score = evaluate(new_state)
    return new_state, score
```

**Evaluation Function**:
- Must return score in [0, 1] range
- Higher scores indicate better solutions
- Can be unit tests, reward models, human feedback, etc.

## Installation & Setup

### Requirements

- **Python**: 3.11 or higher
- **Operating System**: Linux, macOS, or Windows
- **Dependencies**: Automatically installed (JAX, NumPy, NumPyro for Bayesian inference)

### Installation Commands

**Using pip**:
```bash
pip install "treequest[abmcts-m]"
```

**Using uv** (faster, recommended):
```bash
uv add "treequest[abmcts-m]"
```

**Minimal installation** (AB-MCTS-A only, no mixed model):
```bash
pip install treequest
```

### Verify Installation

```python
import treequest as tq
print(tq.__version__)

# Check available algorithms
algo_m = tq.ABMCTSM()
algo_a = tq.ABMCTSA()
print("Installation successful!")
```

## Basic Implementation Example

### Minimal Working Example

```python
import treequest as tq

# Define your generation and evaluation logic
def generate(parent_state=None):
    """Generate or refine a solution."""
    if parent_state is None:
        # Generate new solution from scratch
        new_state = your_llm_call("Solve the problem: ...")
    else:
        # Refine existing solution
        new_state = your_llm_call(f"Improve this solution: {parent_state}")

    # Evaluate the solution
    score = your_evaluation_function(new_state)  # Returns value in [0, 1]

    return new_state, score

# Initialize algorithm (choose variant)
algo = tq.ABMCTSA()  # or tq.ABMCTSM()

# Initialize search tree
search_tree = algo.init_tree()

# Run search for N iterations
num_iterations = 50
for i in range(num_iterations):
    # Single search step: select, expand, update
    search_tree = algo.step(
        search_tree,
        {'Action': generate}  # Pass generation function
    )

    # Optional: track best solution found so far
    best_node = algo.get_best_node(search_tree)
    print(f"Iteration {i+1}: Best score = {best_node.score:.3f}")

# Extract final best solution
final_best = algo.get_best_node(search_tree)
print(f"Final solution: {final_best.state}")
print(f"Final score: {final_best.score}")
```

### With OpenAI API Example

```python
import treequest as tq
from openai import OpenAI

client = OpenAI()

def solve_math_problem(parent_solution=None):
    """Generate or refine a mathematical solution."""
    problem = "Solve: What is the derivative of x^3 + 2x^2 - 5x + 1?"

    if parent_solution is None:
        # Generate new solution
        prompt = f"Problem: {problem}\n\nProvide a step-by-step solution."
    else:
        # Refine existing solution
        prompt = f"Problem: {problem}\n\nPrevious attempt:\n{parent_solution}\n\nImprove this solution by checking for errors and clarifying steps."

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )

    new_solution = response.choices[0].message.content

    # Simple evaluation: check if it contains the correct answer
    correct_answer = "3x^2 + 4x - 5"
    score = 1.0 if correct_answer in new_solution else 0.3

    return new_solution, score

# Run AB-MCTS search
algo = tq.ABMCTSA()
tree = algo.init_tree()

for _ in range(20):
    tree = algo.step(tree, {'Action': solve_math_problem})

best = algo.get_best_node(tree)
print(f"Best solution:\n{best.state}")
```

## Key Implementation Patterns

### 1. Defining Generation Functions

**Pattern: Conditional Generation vs Refinement**

```python
def generate(parent_state=None):
    if parent_state is None:
        # WIDTH: Generate diverse new approaches
        return generate_from_scratch()
    else:
        # DEPTH: Refine existing solution
        return refine_solution(parent_state)

def generate_from_scratch():
    """Encourage diversity in new generations."""
    # Use high temperature for exploration
    response = llm.generate(prompt, temperature=0.9)
    score = evaluate(response)
    return response, score

def refine_solution(parent):
    """Focus refinement on specific improvements."""
    # Lower temperature for focused refinement
    prompt = f"Analyze this solution and fix any errors:\n{parent}"
    response = llm.generate(prompt, temperature=0.3)
    score = evaluate(response)
    return response, score
```

### 2. Implementing Score Evaluators

**Pattern: Multi-Criteria Evaluation**

```python
def evaluate(solution):
    """Combine multiple evaluation criteria."""
    scores = []

    # Criterion 1: Correctness (unit tests)
    if passes_tests(solution):
        scores.append(1.0)
    else:
        scores.append(0.0)

    # Criterion 2: Code quality
    quality_score = analyze_code_quality(solution)  # 0-1
    scores.append(quality_score)

    # Criterion 3: Performance
    perf_score = measure_performance(solution)  # 0-1
    scores.append(perf_score)

    # Weighted combination
    weights = [0.6, 0.2, 0.2]
    final_score = sum(s * w for s, w in zip(scores, weights))

    return final_score
```

**Pattern: Incremental Evaluation**

```python
def evaluate_with_feedback(solution):
    """Provide detailed feedback for refinement."""
    test_results = run_tests(solution)

    if test_results.all_passed:
        score = 1.0
    else:
        # Partial credit based on tests passed
        score = test_results.passed / test_results.total

    # Store feedback for refinement use
    solution.feedback = test_results.failures

    return score
```

### 3. Configuring Search Parameters

**Pattern: Budget-Based Search**

```python
def search_with_budget(problem, max_calls=100):
    """Run search with limited API calls."""
    algo = tq.ABMCTSA()
    tree = algo.init_tree()

    api_calls = 0
    while api_calls < max_calls:
        tree = algo.step(tree, {'Action': generate})
        api_calls += 1

        # Early stopping if perfect solution found
        best = algo.get_best_node(tree)
        if best.score >= 0.99:
            print(f"Found solution in {api_calls} calls!")
            break

    return algo.get_best_node(tree)
```

**Pattern: Time-Based Search**

```python
import time

def search_with_timeout(problem, timeout_seconds=60):
    """Run search with time limit."""
    algo = tq.ABMCTSA()
    tree = algo.init_tree()

    start_time = time.time()
    while time.time() - start_time < timeout_seconds:
        tree = algo.step(tree, {'Action': generate})

    return algo.get_best_node(tree)
```

### 4. Multi-Model Setup for Collaborative Search

**Pattern: Model Pool with Dynamic Allocation**

```python
from openai import OpenAI
import anthropic

# Initialize multiple model clients
openai_client = OpenAI()
anthropic_client = anthropic.Anthropic()

models = {
    'gpt4o': lambda p: openai_client.chat.completions.create(
        model="gpt-4o", messages=[{"role": "user", "content": p}]
    ).choices[0].message.content,

    'claude': lambda p: anthropic_client.messages.create(
        model="claude-sonnet-4-5-20250929", max_tokens=8000,
        messages=[{"role": "user", "content": p}]
    ).content[0].text,

    'deepseek': lambda p: openai_client.chat.completions.create(
        model="deepseek-v3", messages=[{"role": "user", "content": p}]
    ).choices[0].message.content,
}

def multi_model_generate(parent_state=None):
    """Let AB-MCTS select which model to use."""
    # Thompson Sampling will naturally prefer better-performing models

    # Select model (can be random initially, or use another Thompson Sampling layer)
    model_name = select_model()  # Your model selection logic
    model = models[model_name]

    if parent_state is None:
        prompt = "Generate solution..."
    else:
        prompt = f"Refine solution: {parent_state}"

    new_state = model(prompt)
    score = evaluate(new_state)

    # Track which model generated this solution
    new_state.model = model_name

    return new_state, score
```

### 5. Tracking Search Tree State

**Pattern: Visualization and Monitoring**

```python
def search_with_logging(problem, num_iterations=50):
    """Track search progress with detailed logging."""
    algo = tq.ABMCTSA()
    tree = algo.init_tree()

    history = {
        'iterations': [],
        'best_scores': [],
        'tree_width': [],
        'tree_depth': []
    }

    for i in range(num_iterations):
        tree = algo.step(tree, {'Action': generate})

        best = algo.get_best_node(tree)
        history['iterations'].append(i)
        history['best_scores'].append(best.score)
        history['tree_width'].append(count_nodes_at_depth(tree, 1))
        history['tree_depth'].append(get_tree_depth(tree))

        if i % 10 == 0:
            print(f"Iteration {i}: Score={best.score:.3f}, "
                  f"Width={history['tree_width'][-1]}, "
                  f"Depth={history['tree_depth'][-1]}")

    return algo.get_best_node(tree), history
```

## Real-World Application: ARC-AGI-2

The most impressive demonstration of TreeQuest is the **Multi-LLM AB-MCTS** implementation for the ARC-AGI-2 benchmark, which tests abstract reasoning and general intelligence through visual pattern recognition tasks.

### Implementation Details

**Repository**: [github.com/SakanaAI/ab-mcts-arc2](https://github.com/SakanaAI/ab-mcts-arc2)

**Models Used**:
- GPT-4o-mini (OpenAI)
- Gemini-2.5-Pro (Google)
- DeepSeek-R1-0528 (DeepSeek)

### How Models Collaborate on Visual Reasoning

**Phase 1: Independent Solution Generation**
```python
# Each model generates initial solutions independently
solutions = {
    'gpt4o': generate_arc_solution(problem, model='gpt-4o-mini'),
    'gemini': generate_arc_solution(problem, model='gemini-2.5-pro'),
    'deepseek': generate_arc_solution(problem, model='deepseek-r1')
}
```

**Phase 2: Error Analysis and Refinement**
```python
# Models analyze each other's solutions
def collaborative_refinement(solutions):
    for model_name, solution in solutions.items():
        if not is_correct(solution):
            # Other models analyze the error
            feedback = get_feedback_from_other_models(solution)

            # Original model refines based on feedback
            refined = refine_with_feedback(solution, feedback, model_name)
            solutions[model_name] = refined

    return solutions
```

**Phase 3: Thompson Sampling Model Selection**

AB-MCTS learns which models perform better:
- Initially: Equal probability for all models
- After feedback: Higher-performing models sampled more frequently
- Continued exploration: Weaker models still get occasional chances

**Example Success Case**:
```
Task: Identify pattern in visual grid and predict next transformation

Iteration 1: GPT-4o-mini generates incorrect solution (identifies wrong pattern)
Iteration 2: DeepSeek-R1 analyzes GPT's error: "The pattern is rotation, not reflection"
Iteration 3: Gemini-2.5-Pro corrects the approach and generates correct solution
Result: ✓ Solved (no individual model could solve alone)
```

### Results

**Single Model with Repeated Sampling**: 23% success rate
**Single Model with AB-MCTS**: 27.5% success rate
**Multi-LLM AB-MCTS**: >30% success rate

**Key Insight**: The collaborative approach solved problems that were "unsolvable" by any individual model, demonstrating emergent collective intelligence.

### Code Structure

```python
# Simplified version of the ARC-AGI-2 implementation
import treequest as tq

def arc_multi_model_search(problem):
    algo = tq.ABMCTSA()
    tree = algo.init_tree()

    models = ['gpt-4o-mini', 'gemini-2.5-pro', 'deepseek-r1']

    def generate_arc_solution(parent=None):
        # Select model using Thompson Sampling
        model = sample_model_from_posterior(tree, models)

        if parent is None:
            solution = generate_new_solution(problem, model)
        else:
            solution = refine_solution(parent, model)

        # Evaluate against ARC test cases
        score = evaluate_arc_solution(problem, solution)

        return solution, score

    # Search for 100 iterations
    for _ in range(100):
        tree = algo.step(tree, {'Action': generate_arc_solution})

    return algo.get_best_node(tree)
```

## Context Engineering Strategies

TreeQuest applications benefit significantly from [[context-engineering]] principles:

### 1. Prompt Design for Generation vs Refinement

**Generation Prompts** (Width):
```python
generation_prompt = """
Generate a completely new solution to this problem.
Think creatively and consider alternative approaches.

Problem: {problem}

Requirements:
- Provide step-by-step reasoning
- Consider edge cases
- Output in the specified format
"""
```

**Refinement Prompts** (Depth):
```python
refinement_prompt = """
Review and improve this solution by:
1. Identifying any errors or issues
2. Verifying logic and calculations
3. Enhancing clarity and completeness

Original solution:
{parent_solution}

Problem: {problem}

Provide an improved version.
"""
```

### 2. Feedback Signal Integration

**Structured Feedback Pattern**:
```python
def generate_with_structured_feedback(parent=None):
    if parent is None:
        solution = llm.generate(generation_prompt)
    else:
        # Include specific feedback in refinement prompt
        feedback = analyze_solution(parent)
        refinement_prompt = f"""
        Previous solution had these issues:
        {format_feedback(feedback)}

        Fix these specific problems:
        {parent.solution}
        """
        solution = llm.generate(refinement_prompt)

    score = evaluate(solution)
    return solution, score
```

This connects to [[context-engineering]] strategies for providing clear, actionable feedback to guide iterative improvement.

### 3. Balancing Exploration/Exploitation in Agentic Systems

TreeQuest naturally implements exploration-exploitation trade-offs that appear in [[agentic-rag-workflow]]:

**In RAG Context**:
- **Exploration**: Try different retrieval strategies, query reformulations
- **Exploitation**: Refine promising retrieval results, re-rank

**In Multi-Tool Agents** (see [[multi-tool-agent]]):
- **Exploration**: Try different tool combinations
- **Exploitation**: Refine tool usage with best-performing tools

**Pattern**:
```python
def agentic_search_pattern(task):
    """Apply AB-MCTS pattern to agentic workflows."""
    algo = tq.ABMCTSA()
    tree = algo.init_tree()

    def agent_action(parent_plan=None):
        if parent_plan is None:
            # Explore: Generate new plan/approach
            plan = agent.plan(task)
        else:
            # Exploit: Refine existing plan
            plan = agent.refine_plan(parent_plan)

        # Execute and evaluate
        result = agent.execute(plan)
        score = evaluate_result(result, task)

        return plan, score

    for _ in range(iterations):
        tree = algo.step(tree, {'Action': agent_action})

    return algo.get_best_node(tree)
```

## Benefits & Considerations

### When to Use TreeQuest

**Good Use Cases**:
1. **Tasks with clear evaluation metrics**: Unit tests, correctness checks, reward models
2. **Problems benefiting from refinement**: Iterative improvement leads to better solutions
3. **Value of diverse approaches**: Multiple valid solution strategies exist
4. **Sufficient computational budget**: Have enough API calls to benefit from search (≥50 iterations recommended)
5. **Complex reasoning tasks**: Abstract reasoning, competitive programming, ML engineering

**Poor Use Cases**:
1. **Simple tasks**: Overhead not justified for trivial problems
2. **No clear evaluation**: Can't automatically score solution quality
3. **Limited budget**: Very few API calls available (<10)
4. **Single solution path**: Problem has only one obvious approach
5. **Real-time requirements**: Search process takes too long

### Computational Budget Planning

**Budget Allocation**:
- **Minimum viable**: 20-30 iterations
- **Recommended**: 50-100 iterations
- **Optimal**: 100-500 iterations depending on problem complexity

**Cost Estimation**:
```python
# Example cost calculation
api_calls_per_iteration = 1  # TreeQuest makes 1 call per step
num_iterations = 100
cost_per_call = 0.01  # Example: $0.01 per GPT-4 call

total_cost = api_calls_per_iteration * num_iterations * cost_per_call
# = 1 * 100 * $0.01 = $1.00
```

**Multi-Model Cost**:
```python
# With 3 models, each gets ~33 calls on average
# But better models may get more via Thompson Sampling
num_models = 3
avg_calls_per_model = num_iterations / num_models
```

### Score Evaluator Design Requirements

**Essential Properties**:
1. **Returns [0, 1] range**: Required for Bayesian inference
2. **Informative**: Distinguishes between solution quality levels
3. **Consistent**: Same solution gets same score
4. **Fast**: Evaluation shouldn't dominate runtime

**Design Patterns**:

**Binary Evaluator** (simple):
```python
def binary_eval(solution):
    return 1.0 if passes_all_tests(solution) else 0.0
```
- Simple but less informative
- Works well with Beta prior (AB-MCTS-A)

**Gradual Evaluator** (better):
```python
def gradual_eval(solution):
    tests_passed = run_tests(solution)
    return tests_passed.count / tests_passed.total
```
- More informative for refinement
- Guides search toward improvement

**Multi-Criteria Evaluator** (best):
```python
def comprehensive_eval(solution):
    correctness = test_correctness(solution)  # 0-1
    efficiency = measure_efficiency(solution)  # 0-1
    clarity = assess_readability(solution)  # 0-1

    return 0.6 * correctness + 0.3 * efficiency + 0.1 * clarity
```
- Balances multiple objectives
- Reflects real-world quality metrics

### Multi-Model Selection Strategies

**Strategy 1: Fixed Pool**
```python
models = ['gpt-4o', 'claude-sonnet', 'deepseek-v3']
# AB-MCTS automatically learns which performs best
```

**Strategy 2: Specialized Models**
```python
models = {
    'coder': 'gpt-4o',  # Best for code generation
    'reasoner': 'claude-sonnet',  # Best for analysis
    'optimizer': 'deepseek-v3'  # Best for refinement
}
# Can bias selection based on task phase
```

**Strategy 3: Cost-Performance Trade-off**
```python
# Use cheaper models for exploration, expensive for exploitation
def select_model_by_phase(is_generation):
    if is_generation:
        return 'gpt-4o-mini'  # Cheaper for diversity
    else:
        return 'gpt-4o'  # Better for refinement
```

## Related Technologies & Patterns

### Related Research and Optimization Tools
- [[research-agents]]: Similar optimization and hypothesis testing approach
  - Both use iterative refinement with feedback
  - AB-MCTS provides more structured search compared to ad-hoc research strategies
  - Research agents could use AB-MCTS internally for hypothesis generation/refinement

### Related Agentic Patterns
- [[agentic-rag-workflow]]: Search-based patterns in retrieval contexts
  - RAG could use AB-MCTS for query refinement and retrieval strategy optimization
  - Thompson Sampling applicable to balancing different retrieval methods

- [[multi-tool-agent]]: Multi-step reasoning and tool selection
  - Tool selection is another explore-exploit problem
  - AB-MCTS could guide which tools to try vs refine tool usage

### Context Engineering Connection
- [[context-engineering]]: Prompt design for generation vs refinement phases
  - Generation prompts: Encourage creativity and diversity
  - Refinement prompts: Focus on specific improvements
  - Feedback integration: Clear, actionable critique for iterative improvement

### Performance Optimization
- [[context-compression-pruning]]: Could be applied to AB-MCTS state management
  - Compress solution states to reduce token usage
  - Prune low-probability branches to save computation

## Resources

### Official Implementation
- **GitHub**: [github.com/SakanaAI/treequest](https://github.com/SakanaAI/treequest)
- **License**: Apache 2.0
- **Installation**: `pip install "treequest[abmcts-m]"` or `uv add "treequest[abmcts-m]"`

### Real-World Applications
- **ARC-AGI-2 Implementation**: [github.com/SakanaAI/ab-mcts-arc2](https://github.com/SakanaAI/ab-mcts-arc2)
  - Multi-model collaboration example
  - Visual reasoning tasks
  - Benchmark code and evaluation

### Benchmark Datasets
- **CodeContests**: [github.com/google-deepmind/code_contests](https://github.com/google-deepmind/code_contests)
  - Competitive programming problems
  - HuggingFace: [huggingface.co/datasets/deepmind/code_contests](https://huggingface.co/datasets/deepmind/code_contests)

- **MLE-Bench**: [github.com/openai/mle-bench](https://github.com/openai/mle-bench)
  - Machine learning engineering tasks
  - Paper: [arxiv.org/abs/2410.07095](https://arxiv.org/abs/2410.07095)

### Documentation and Tutorials
- **Sakana AI Official**: [sakana.ai/ab-mcts/](https://sakana.ai/ab-mcts/)
- **Research Paper**: [arxiv.org/abs/2503.04412](https://arxiv.org/abs/2503.04412)
- **Concept Details**: See [[ab-mcts]] for algorithm theory and foundations

### Analysis and Reviews
- **Technical Review**: [themoonlight.io - Wider or Deeper review](https://www.themoonlight.io/en/review/wider-or-deeper-scaling-llm-inference-time-compute-with-adaptive-branching-tree-search)
- **VentureBeat Coverage**: [TreeQuest multi-model teams article](https://venturebeat.com/ai/sakana-ais-treequest-deploy-multi-model-teams-that-outperform-individual-llms-by-30)
- **NeuroHive Analysis**: [TreeQuest framework analysis](https://neurohive.io/en/frameworks/treequest-framework-adaptive-llm-teams-outperform-individual-models-by-30/)

---

## Changelog
- **2025-10-04**: Initial creation with comprehensive implementation guide, code examples, patterns, and real-world applications
