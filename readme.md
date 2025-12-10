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

## Agent Handoffs

main agent other service er agent er sathe kotha bole

handoff mane holo sales agent refund agent k hand over kore dibe call

# caution \*\*

instruction e "handoff" word na thakle handoff korbe na

handoff description e j j agent k handoff korbo oder context dite hbe ora ki ki kaj kore amon

openai team recomended promt prefix banai dise handoff er jonno - " RECOMMENDED_PROMPT_PREFIX "

```
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
```

## LLMs respond more reliably when your prompts mention handoffs

```

const receptionAgent = new Agent({
    name:"Reception Agent",
    instructions:`
    ${RECOMMENDED_PROMPT_PREFIX}
    You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent`,
    handoffDescription:`You have two agents avaiable.
    - salesAgent: Expert is handling queries like all plans and pricing avaiable. Good for new customers.
    - refundAgents: Expert in handling user queries for existing customers and issue refunds and help them.
    `,
    handoffs:[salesAgent,refundAgent]
})
```

# Guardrails == Border Line

Guardrails which enable validation of agent inputs and outputs.

Ai abuse korte pare onk sensitive data lick korte pare, political opinion dite parbe, same user input e o same validation, karon user personal info lick korte pare or abuse korte pare or illigal kichu cyte pare

one agent can not answer other question like math agent can not answer poem

perform checks and validation on user input and agent output

==> math agent - Input Guardrail - [Rule: Please make sure that the question is related to the maths only].

user input jabe Guardrails er kache - if math question na hoi then crash \*\* then

tripwireTrigger: true --> aita kore dile connection cut out hobe... ei agent invoke hbe na kokhono.

jodi input math question hoi then false thake so invoke hoi and dei agent properly

## Conversation threads / chat threads- short time memory

Each call to runner.run() (or run() utility) represents one turn in your application-level conversation. You choose how much of the RunResult you show the end‑user – sometimes only finalOutput, other times every generated item.

the problem is user jodi kono kichu bole like name, then kichu run kore , oita 1st time run krbe and ans dibe, next time r user name k chinbe na, oitae memory loss mainly .

```
let sharedHistory = []

async function main(q="") {
    // store the message in DB (history)
    sharedHistory.push({role:"user",content:q})
    const result = await run(sqlAgent,sharedHistory);
    sharedHistory = result.history
    console.log(result.finalOutput);


}
```

that means all history track on the sharedHistory array 


