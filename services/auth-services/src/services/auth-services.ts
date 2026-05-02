import bcrypt from "bcryptjs";
import { AuthCredentialsRepository } from "../repository/auth-credentials";
import { AuthDeviceRepository } from "../repository/auth-device";
import { AuthUserRepository } from "../repository/auth-user";
import { LoginDTO, RegisterSubAdminDTO } from "../schema/auth-schema";
import { JobTypes } from "@packages/queue/jobs";
import { AppQueue } from "@packages/queue/queue";
import { generateCompanyId } from "@packages/utils/utils";
import prisma from "../config/prismaClient";
import { createError } from "../utils";
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from "../config/config";
import { id } from "zod/v4/locales";
import { token } from "morgan";

export const User = {
    SUPER_ADMIN: "SUPER ADMIN",
    SUB_ADMIN: "SUB ADMIN",
    TRADESMAN: "TRADESMAN",
    PROJECT_MANAGER: "PROJECT MANAGER",
    COMPETENT_PERSON: "COMPETENT PERSON",
}



export class AuthService {

    userRepository: AuthUserRepository;
    credentialRepository: AuthCredentialsRepository;
    deviceRepository: AuthDeviceRepository;


    constructor() {
        this.userRepository = new AuthUserRepository();
        this.credentialRepository = new AuthCredentialsRepository();
        this.deviceRepository = new AuthDeviceRepository();
    }

    async register(data: RegisterSubAdminDTO) {

        const existing = await this.credentialRepository.findByEmail(data.email);

        if (existing) {
            throw createError("Email already registered", 409);
        }

        // 1. CREATE USER
        const user = await this.userRepository.create({
            name: data.name,
            mobileNumber: data.mobileNumber,
            countryCode: data.countryCode,
            addressLine: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            userType: data.userType,
            status: "ACTIVE",
            isDeleted: false,
            isVerified: true
        });

        // 2. CREATE PASSWORD
        const hashedPassword = bcrypt.hashSync(data.password, 10);

        await this.credentialRepository.create({
            userId: user.id,
            email: data.email,
            password: hashedPassword
        });

        // 3. NOTIFICATION
        const superAdmins = await this.userRepository.findSuperAdmins();
        const superAdmin = superAdmins?.[0];

        if (superAdmin) {
            await AppQueue.add(JobTypes.PUSH_NOTIFICATION, {
                title: "New User Registered",
                message: `${user.name} registered`,
                type: "AUTH",
                role: "SUPER ADMIN",
                receiverId: Number(superAdmin.id),
                senderId: user.id.toString(),
                notificationImage: data.image || null,
            });
        }

        // 4. COMPANY ID ONLY FOR SUB_ADMIN
        let companyId: string | null = null;

        if (data.userType === User.SUB_ADMIN) {
            const cmpId = generateCompanyId();

            await prisma.companyIdentity.create({
                data: {
                    authUserId: user.id,
                    companyId: cmpId,
                    userType: User.SUB_ADMIN
                }
            });

            companyId = cmpId;
        }

        // 5. RESPONSE BUILDER (ROLE BASED)
        const response: any = {
            id: Number(user.id),
            name: user.name,
            email: data.email,
            mobileNumber: user.mobileNumber,
            countryCode: user.countryCode,
            addressLine: user.addressLine,
            latitude: user.latitude,
            longitude: user.longitude,
            userType: user.userType
        };

        // 🔥 ONLY SUB ADMIN GETS CMP ID
        if (data.userType === User.SUB_ADMIN) {
            response.cmpId = companyId;
        }

        return {
            message: "User registered successfully",
            data: response
        };
    }


  async login(data: LoginDTO) {

    const userCred = await this.credentialRepository.findByEmail(data.email);

    if (!userCred) {
        throw createError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(data.password, userCred.password);

    if (!isValid) {
        throw createError("Invalid email or password", 401);
    }

    const user = await prisma.authUser.findFirst({
        where: {
            id: userCred.userId,
            isDeleted: false,
            isVerified: true,
            status: "ACTIVE"
        }
    });

    if (!user) {
        throw createError("User not active or not found", 403);
    }

    // 🔵 CMPID (ONLY PM / CP)
    let company = null;

    if (
        user.userType === User.PROJECT_MANAGER ||
        user.userType === User.COMPETENT_PERSON
    ) {
        company = await prisma.companyIdentity.findUnique({
            where: { authUserId: user.id }
        });
    }

    // 🟢 PROJECT ID (ONLY TRADESMAN)
    // let projectId = null;

    // if (user.userType === User.TRADESMAN) {
    //     const assigned = await prisma.projectMember.findFirst({
    //         where: { userId: user.id }
    //     });

    //     projectId = assigned?.projectId || null;
    // }

    // 🔐 JWT
    const payload: any = {
        sub: String(user.id),
        email: userCred.email,
        role: user.userType
    };

    if (company) payload.cmpId = company.companyId;
    // if (projectId) payload.projectId = projectId;

  

    const refreshToken = jwt.sign(
        {
            sub: String(user.id),
            role: user.userType,
            type: "refresh"
        },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    await prisma.authCredentials.update({
        where: { email: data.email },
        data: { lastLogin: new Date() }
    });

    // 🚀 RESPONSE BUILDER (ROLE BASED)
    const response: any = {
        id: Number(user.id),
        name: user.name,
        email: userCred.email,
        userType: user.userType, 
        refreshToken
    };

    // 🟡 PM / CP → CMPID
    if (company) {
        response.cmpId = company.companyId;
    }

    // 🟢 TRADESMAN → PROJECT ID
    // if (projectId) {
    //     response.projectId = projectId;
    // }

    return {
        message: "Login successful",
        data: response
    };
}
}