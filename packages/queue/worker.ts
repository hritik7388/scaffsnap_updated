import { Worker } from "bullmq";
import { connection } from "./connection";
import nodemailer from "nodemailer"; 
import { randomUUID } from "crypto";
import prisma from "services/auth-services/src/config/prismaClient";

console.log("🚀 Worker file loaded");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const worker = new Worker(
  "APP_QUEUE",
  async (job) => {

    console.log("🔥 JOB RECEIVED:", job.name, job.data);

    switch (job.name) {

      case "SEND_EMAIL":
        await transporter.sendMail({
          from: "noreply@scaffold.com",
          to: job.data.to,
          subject: job.data.subject,
          html: job.data.html,
        });
        break;

      case "SEND_OTP":
        await transporter.sendMail({
          from: "noreply@scaffold.com",
          to: job.data.email,
          subject: "OTP Verification",
          html: `<h1>Your OTP: ${job.data.otp}</h1>`,
        });
        break;

      case "PUSH_NOTIFICATION":
        await prisma.notification.create({
          data: {
            uuid: randomUUID(),
            title: job.data.title,
            message: job.data.message,
            type: job.data.type,
            role: job.data.role,
            receiverId: job.data.receiverId,
            senderId: job.data.senderId,
            notificationImage: job.data.notificationImage || null,
            isRead: false,
          },
        });

        console.log("✅ Notification saved");
        break;
    }
  },
  { connection }
);

 

worker.on("completed", (job) => {
  console.log("🎯 Completed:", job.id);
}); 