import "dotenv/config";
import { Agent ,run, tool} from "@openai/agents";
import {z} from "zod"



const executeSQL = tool({
    name:"execute_sql",
    description: "this executes the SQL query",
    parameters:z.object({
        sql:z.string().describe("the sql query")
    }),
    execute: async function ({sql}) {
        console.log(`[SQL]: Execute the SQL ${sql}`)
        return "done"    
    },
    
})


const sqlAgent = new Agent({
  name: "sql Expert Agent",
  tools:[executeSQL],
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
})


async function main(q="") {
 
    const result = await run(sqlAgent,q,{
        conversationId:"conv_693919d65cb4819790529c7a9fe307b90bd2f306bf8b681b"
    });
   
    console.log(result.finalOutput);

    
}

main("write a query to get all users with my name")
