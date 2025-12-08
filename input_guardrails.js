import "dotenv/config"
import {Agent,InputGuardrailTripwireTriggered,run} from "@openai/agents"
import {z} from "zod"

const mathInputAgent = new Agent({
    name:"Math query checker",
    instructions:`you are an input guardrail agent that checks if the user query is a maths problem or not
    Rules:
    - the question is strictly a maths equation only.
    
    `,
    outputType:z.object({
        isValidMathQuestion: z.boolean().describe("if the question is a maths question"),
        reason:z.string().optional().describe("this the reason to reject request")
    })
})


const mathInputGuardrail = {
    name: "Math Homework Guardrail",
    execute: async({input}) =>{
        console.log(input)
        const result =await run(mathInputAgent,input)
        return{
            outputInfo: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isValidMathQuestion
        }
    }
}


const mathAgent =new Agent({
    name:"Maths Agent",
    instructions: "You are an expert maths ai agent",
    inputGuardrails:[mathInputGuardrail]
})

async function main(q="") {
    try {
        const result =await run(mathAgent,q)
    console.log(result.finalOutput)
    } catch (e) {
        if(e instanceof InputGuardrailTripwireTriggered){
            console.log(`Invalid input rejected because: ${e.message}`)
        }
        
    }
    
}

main('4x+4=500, find the value of x?')
