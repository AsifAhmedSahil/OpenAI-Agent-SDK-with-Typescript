import "dotenv/config"
import { Agent, run } from "@openai/agents";
// Agent aktya class agewnt bananor jonno
// run akta funtion loop e agant k run koranor jonno

const helloAgent = new Agent({
  name: "sahil",
  instructions:
    "you are an agent that always says hello with users name ",
});

run(helloAgent, "Hey there, My name is asif ahmed sahil").then((result) => {
  console.log(result.finalOutput);
});
