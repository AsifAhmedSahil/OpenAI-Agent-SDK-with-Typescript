import "dotenv/config";
import { Agent, run, RunContext, tool } from "@openai/agents";
import z from "zod";

interface MyContext{
    userId:string,
    userName:string

    // dependecies function
    // fetchUserInfoFromDb: () => Promise<string | undefined>
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