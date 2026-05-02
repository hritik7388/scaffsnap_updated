import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";
import crypto from "node:crypto"; 

export const createDefaultSuperAdmin = async (email: string) => {
const existingUser = await prisma.authCredentials.findUnique({
    where: { email: process.env.SUPERADMIN_EMAIL }
});

if (existingUser) {
    console.log("SuperAdmin already exists, skipping seed");
    return;
}

  if (!email) {
    throw new Error("SuperAdmin email is required");
  }

  const tempPass = crypto.randomBytes(6).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPass, 12);

  const user = await prisma.authUser.create({
    data: {
      name: "Default SuperAdmin",
      mobileNumber: "9999999999",
      countryCode: "+91",
      userType: "SUPER ADMIN",
      status: "ACTIVE",
      isVerified: true,
      addressLine: "",
      latitude: 0,
      longitude: 0,

      credentials: {
        create: {
          email:"scaffsnap@mailinator.com",
          password: hashedPassword,
        },
      },
    },
    include: {
      credentials: true,
    },
  });

  console.log("SuperAdmin created");
  console.log({
    email,
    tempPass,
  });

  return user;
};