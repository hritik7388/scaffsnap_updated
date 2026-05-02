import { Queue } from "bullmq";
import { connection } from "./connection";

export const AppQueue = new Queue("APP_QUEUE", {
  connection,
});