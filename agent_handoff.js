import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import fs from "node:fs/promises";

const processRefund = tool({
  name: "processes_refund",
  description: "the tool processes refund from the customers",
  parameters: z.object({
    customerId: z.string().describe("this is the customer id"),
    reason: z.string().describe("this is the refund reason"),
  }),
  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refund.txt",
      `Refund for customer having ids ${customerId} for ${reason}`,
      "utf-8"
    );

    return { refundIssues: true };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions: `You are expert in issuing refunds to the customer `,
  tools: [processRefund],
});

// sales agent

const fetchAvaiablePlans = tool({
  name: "fetch_avaiable_plans",
  description: "fetches the avaiable plans for internet",
  parameters: z.object({}),
  execute: async function () {
    return [
      { plan_id: "1", price_bdt: 399, speed: "30MB/s" },
      { plan_id: "2", price_bdt: 999, speed: "100MB/s" },
      { plan_id: "3", price_bdt: 1499, speed: "200MB/s" },
    ];
  },
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: `
        you are an expert sales agent for an internet broadband company, talk to the user and help then with what they need.tell then about plans
    `,
  tools: [
    fetchAvaiablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Hnadlhandle refund questions and requests.",
    }),
  ],
});

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


async function main(query="") {
    const result = await run(receptionAgent,query)
    console.log("result:",result.finalOutput)
    console.log("history:",result.history)
    
}

main("hey there, i am facing slow internet issue, customer id cus123, i have a plan 399, i want to refund my plan")
