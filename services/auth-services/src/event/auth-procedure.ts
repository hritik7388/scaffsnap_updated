import { AppQueue } from "@packages/queue";
import { AuthEvents } from "./auth.events";


export const emitRegisterSubAdmin = async (data: any) => {

    await AppQueue.add("SEND_EMAIL", {
        to: data.email,
        subject: "SubAdmin Created",
        html: `<h1>Welcome ${data.name}</h1>`,
    });

    await AppQueue.add("PUSH_NOTIFICATION", {
        userId: data.userId,
        message: "SubAdmin created successfully",
    });

};
// 🔐 LOGIN API
export const emitLogin = async (data: any) => {

    await AppQueue.add("PUSH_NOTIFICATION", {
        userId: data.userId,
        message: "New login detected",
    });

};
// 🚪 LOGOUT API
export const emitLogout = async (data: any) => {

    await AppQueue.add("PUSH_NOTIFICATION", {
        userId: data.userId,
        message: "Logged out successfully",
    });

};
// 🔁 FORGOT PASSWORD API
export const emitForgotPassword = async (data: any) => {

    await AppQueue.add("SEND_OTP", {
        email: data.email,
        otp: data.otp,
    });

};
// 🔐 RESET PASSWORD API
export const emitResetPassword = async (data: any) => {

    await AppQueue.add("SEND_EMAIL", {
        to: data.email,
        subject: "Password Reset Successful",
        html: "Your password has been updated",
    });

};
// 📱 DEVICE DETECTED API
export const emitDeviceDetected = async (data: any) => {

    await AppQueue.add("SEND_EMAIL", {
        to: data.email,
        subject: "New Device Login",
        html: `New device detected: ${data.device}`,
    });

    await AppQueue.add("PUSH_NOTIFICATION", {
        userId: data.userId,
        message: "New device detected",
    });

};
// ⚠️ UNUSUAL ACTIVITY API
export const emitUnusualActivity = async (data: any) => {

    await AppQueue.add("SEND_EMAIL", {
        to: data.email,
        subject: "Security Alert",
        html: "Unusual activity detected on your account",
    });

    await AppQueue.add("PUSH_NOTIFICATION", {
        userId: data.userId,
        message: "Unusual activity detected",
    });

};