import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { Resend } from "resend";
import readline from "node:readline/promises"

const resend = new Resend(process.env.RESEND_API_KEY)

const getWeatherTool = tool({
  name: "get_weather",
  description: "return the current weather information for the given city.",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),

  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });

    return `the weather of ${city} is ${response.data}`;
  },
});

const sendEmailTool = tool({
  name: "send_email",
  description: "Send the email to the user",
  parameters: z.object({
    to: z.string().describe("to email address"),
    subject: z.string().describe("subject of the email"),
    html: z.string().describe("html body for the email"),
  }),
  needsApproval:true,
  execute: async function ({html,subject,to}){
        // here setup resend and send email
        try {
            await resend.emails.send({
                from: "Weather Bot <onboarding@resend.dev>",
                to:to,
                subject,
                text:html

            })

            return `Email sent successfully to ${to}`
        } catch (error:any) {
            return `Email sending failed: ${error.message}`
        }
    }
});

const agent = new Agent({
  name: "Weather Email Agent",
  instructions: `You are an expert agent in getting weather data and send to the user using email`,
  tools: [getWeatherTool, sendEmailTool],
});

// ask for confirmation function
async function askForConfirmation(ques:string) {
    const rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout,
    })

    const answer = await rl.question(`${ques} (y/n):`)
    const normalizedAnswer = answer.toLowerCase();
    rl.close();
    return normalizedAnswer === "y" || normalizedAnswer === "yes"
    
}

async function main(query: string) {
  let result = await run(agent, query);
//   console.log(result.interruptions);
let hasInteruptions = result.interruptions.length > 0;
while(hasInteruptions){
    const currentState = result.state;
    for (const interupt of result.interruptions){
        if(interupt.type === "tool_approval_item"  &&
        interupt.rawItem.type === "function_call"){

            const isAllowed = await askForConfirmation(
                `Agent ${interupt.agent.name} is asking for calling tool ${interupt.rawItem.name} with args ${interupt.rawItem.arguments}`
            )

            if(isAllowed){
                currentState.approve(interupt)
            }else{
                currentState.reject(interupt)
            }
            result = await run(agent,currentState)
            hasInteruptions = result.interruptions?.length > 0;

        }

    }
}

}

main(
  "what is the weather in chittagong and dhaka, and send me on asifahmedsahil.007@gmail.com. if any issue sending email then tell me the issue"
);
