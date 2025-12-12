import "dotenv/config";
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "StoryTeller",
  instructions: `You are a story teller. you will be given a topic and you will tell a story about it.`,
});

async function main(query: any) {
  const result = await run(agent, query, { stream: true });
  // const stream = result.toTextStream()

  // for await(const val of stream){
  //     console.log(val);
  // }
  const stream = result
    .toTextStream({ compatibleWithNodeStreams: true })
    .pipe(process.stdout);
}

main("tell me a story in 300 word about macbook");
