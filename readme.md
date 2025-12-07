
<!-- agent build -->
<!-- agent tools - tools calling -->

<!-- agnet manager - multi agent system design -->

# Agent Call Another Agent
Multi-agent system design patterns
There are many ways to compose agents together. Two patterns we regularly see in production apps are:

# Manager
 (agents as tools) – a central agent owns the conversation and invokes specialized agents that are exposed as tools.
# Handoffs
  the initial agent delegates the entire conversation to a specialist once it has identified the user’s request.

  Manager (agents as tools)

In this pattern the manager never hands over control—the LLM uses the tools and the manager summarizes the final answer. 

here I will implement and talk about Multi Agent System Design. Work with multiple agents and many ways to compose agents together. 
also learn Manager Pattern (agents as tools) – a central agent owns the conversation and invokes specialized agents that are exposed as tools.





