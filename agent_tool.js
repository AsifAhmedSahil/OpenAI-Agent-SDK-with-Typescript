// tool is like agent er haat paa, agent is like brain

// here build weather agent and with the help of tool calling we can fetch the weather updated data
import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

const GetWeatherResultSchema = z.object({
  city: z.string().describe("name of the city"),
  degree_c:z.number().describe("the degree celcius"),
  condition: z.string().describe("condition of the weather of city")
})

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
    name:"send email",
    description:"This tool sends an email",
    parameters:z.object({
        toEmail:z.string().describe("email address to"),
        subject:z.string().describe("subject"),
        body:z.string().describe("body of the email")
    }),
    execute: async function ({body,subject,toEmail}){
        // here setup resend and send email
        try {
            await resend.emails.send({
                from: "Weather Bot <onboarding@resend.dev>",
                to:toEmail,
                subject,
                text:body

            })

            return `Email sent successfully to ${toEmail}`
        } catch (error) {
            return `Email sending failed: ${error.message}`
        }
    }
})

const agent = new Agent({
  name: "Weather agent",
  instructions: `
    You are an expert weather agent that helps user to tell weather report and email this weather data.
    `,
  tools: [getWeatherTool,sendEmailTool],
  outputType:GetWeatherResultSchema
});

async function main(query) {
  const result = await run(agent, query);
  console.log("Result", result.finalOutput);
}

main("what is the weather of dhaka at asifahmedsahil.007@gmail.com");
