import { Queue } from "bullmq";

const connection = {
  host: "127.0.0.1",
  port: 6379,
};

export const emailQueue = new Queue("EMAIL_QUEUE", { connection });
export const notificationQueue = new Queue("NOTIFICATION_QUEUE", { connection });