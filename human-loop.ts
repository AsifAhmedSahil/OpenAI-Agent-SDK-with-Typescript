import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

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
  execute: async ({ to, subject, html }) => {
    const API_KEY =
      "AS_dd7d8755a51a5c7bd7e9900d10d909eb0fa6beba.QreIVJETSsaFlSOeS04BoqUCUWr1ssKKGbK-g8QWIf8";
    const response = await axios.post(
      "https://api.autosend.com/v1/mails/send",
      {
        from: {
          email: "no-reply@example.com",
          name: "AI Weather Agent",
        },
        to: {
          email: to,
        },
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data;
  },
});

const agent = new Agent({
  name: "Weather Email Agent",
  instructions: `You are an expert agent in getting weather data and send to the user using email`,
  tools: [getWeatherTool,sendEmailTool],
});

async function main(query: string) {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main("what is the weather in chittagong and dhaka, and send me on asifahmedsahil.007@gmail.com. if any issue sending email then tell me the issue");
