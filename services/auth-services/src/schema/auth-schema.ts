import { z } from "zod";

export const registerSubAdminSchema = z.object({
    name: z.string().min(1, "Company Name is required"),

    email: z.string().email("Invalid email format").min(1, "Email is required"),

    image: z.string().optional(),

    password: z.string().min(8, "Password must be at least 8 characters long"),
    userType: z.string().min(1, "User type is required"),

    mobileNumber: z
        .string()
        .min(8, "Phone number must be at least 10 characters long")
        .max(16, "Phone number cannot exceed 15 characters"),

    countryCode: z.string().optional(),

    address: z.string().min(1, "Address is required"),

    latitude: z.number().optional(),

    longitude: z.number().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    userType: z.enum([
        "SUPER_ADMIN",
        "SUB_ADMIN",
        "PROJECT_MANAGER",
        "COMPETENT_PERSON",
        "TRADESMAN"
    ]),

    cmpId: z.string().optional(),
    projectId: z.string().optional(),
    craft: z.string().optional(),

    // 📱 DEVICE FIELDS (ADDED)
    deviceToken: z.string().optional(),
    deviceType: z.string().optional(),
    deviceName: z.string().optional(),
    appVersion: z.string().optional(),
    osVersion: z.string().optional(),
});

export type RegisterSubAdminDTO = z.infer<typeof registerSubAdminSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;