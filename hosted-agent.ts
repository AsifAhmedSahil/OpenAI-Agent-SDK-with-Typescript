import "dotenv/config";
import { Agent, MCPServerStreamableHttp, run } from "@openai/agents";

const githubMcpServer = new MCPServerStreamableHttp({
    url:"https://gitmcp.io/openai/codex",
    name:"GitMCP Documentation Server", 
})


const agent = new Agent({
    name:"MCP Assistant",
    instructions: `you must always use the MCP tools to answer question.`,
    mcpServers:[githubMcpServer]
    
})

async function main(q:string) {
    await githubMcpServer.connect()
    const result  = await run(agent,q)
    console.log(result.finalOutput)
    await githubMcpServer.close()
    
}

main("what is the repo about?")