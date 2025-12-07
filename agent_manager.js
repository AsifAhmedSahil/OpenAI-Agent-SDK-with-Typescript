import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import fs from "node:fs/promises";

// sales agent build

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

async function runAgent(query = "") {
  const result = await run(salesAgent, query);
  console.log(result.finalOutput);
}

runAgent(
  "hey there. i has a plan 399. i want refund now, my cus id is CUS123, reason i shift my home location"
);
