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

## server managed thread

You can let the OpenAI Responses API persist conversation history for you instead of sending your entire local transcript on every turn.

means, akta conversational id create kore oita dia agent k run korale then conversation server e save thakbe

### create conversation ID

```
import "dotenv/config";

import {OpenAI} from "openai"

const client = new OpenAI()

client.conversations.create({}).then(e =>{
    console.log(`conversation thread created id=`,e.id)
})
```

### add conversation id to the agent

```
async function main(q="") {

    const result = await run(sqlAgent,q,{
        conversationId:"conv_693919d65cb4819790529c7a9fe307b90bd2f306bf8b681b"
    });

    console.log(result.finalOutput);


}
```
## Runtime Local-Context Management

in LLm context are avaiable data in chat == context

but runtime context == local context

problem :
there are one customer support agent , 3 user call it same time, but it has one tool, how he can find when tool call for which user.

ans ==> jokhon run hobe agent then run() call hobe , oikhane data hisebe dependency injection jabe user er information , which is context , jeta runtime e dite hbe, then agent bujte parbe kon user er jonno tool call hobe.

aitae mainly context management

### here user typescript because it gives us flexibility

this is the runtime context access directly from  agent body 
```
interface MyContext{
    userId:string,
    userName:string
}

const customerSupportAgent = new Agent<MyContext>({
    name:"Customer Support Agent",
    instructions:({context})=>{
        return `you are an customer support agent.\nContext:${JSON.stringify(context)}`
    }

})

async function main(query:string,ctx:MyContext) {
    const result = await run(customerSupportAgent,query,{
        context:ctx 
    })
    console.log("/result:",result.finalOutput)
    
}

main("hi,what is my name?",{
    userId:"1",
    userName:"Asif"
})
```

# this is the tool call runtime context access 
here agent call tool and provide context => aita holo agent context , ager ta runtime local context.
```
interface MyContext{
    userId:string,
    userName:string
}

const getUserInfoTool = tool({
    name:"get_user_data",
    description:"Gets the user info",
    parameters:z.object({}),
    execute: async(_,ctx?: RunContext<MyContext>):Promise<string> =>{
        return `UserId=${ctx?.context.userId}\n UserName=${ctx?.context.userName}`
    }
})

const customerSupportAgent = new Agent<MyContext>({
    name:"Customer Support Agent",
    tools:[getUserInfoTool],
    instructions:({context})=>{
        return `you are an customer support agent.`
    }

})

async function main(query:string,ctx:MyContext) {
    const result = await run(customerSupportAgent,query,{
        context:ctx 
    })
    console.log("/result:",result.finalOutput)
    
}

main("hi,what is my name?",{
    userId:"1",
    userName:"Asif"
})
```
## Streaming LLM Responses

for enable the stream call {stream:true} in the run function

// Normal stream 
```
async function main(query: any) {
  const result = await run(agent, query, { stream: true });
  const stream = result.toTextStream();

  for await (const val of stream) {
    console.log(val);
  }
}
```

<!-- node js stream like  -->
```
async function main(query: any) {
  const result = await run(agent, query, { stream: true });
   const stream = result.toTextStream({compatibleWithNodeStreams:true}).pipe(process.stdout)
}
```

aita korle line e serially stream hobe


