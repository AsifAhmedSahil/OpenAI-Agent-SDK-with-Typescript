import "dotenv/config";
import { Agent, run } from "@openai/agents";
import {z} from "zod"


// guardrails
const sqlGuardrailAgent = new Agent({
    name:"SQL guardrails",
    instructions:`
        Check if query is safe to execute. The query should be read only and do not modify,delete or drop any table.
    `,
    outputType: z.object({
        isSafe: z.boolean().describe("whether the SQL query is safe"),
        reason: z.string().nullable().describe("reason if unsafe")
    })
})

const sqlGuardrail = {
    name:"SQL guard",
    async execute({agentOutput}){
        const result = await run(sqlGuardrailAgent,agentOutput.sqlQuery)
        return {
            outputInfo: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isSafe
            
        }
    }
}

const sqlAgent = new Agent({
  name: "sql Expert Agent",
  instructions: `
    You are an expert SQL Agent that is specialized in generating SQL queries as per user request.

    Postgres Schema:
    -- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

    `,
    outputType: z.object({
        sqlQuery: z.string().optional().describe("sql query")
    }),
    outputGuardrails:[sqlGuardrail]
});

async function main(q = "") {
    const result = await run(sqlAgent,q)
    console.log(`Query: `,result.finalOutput.sqlQuery)
    
}

main("give me all the comments")
