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
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/config";

export const User = {
    SUPER_ADMIN: "SUPER ADMIN",
    SUB_ADMIN: "SUB ADMIN",
    TRADESMAN: "TRADESMAN",
    PROJECT_MANAGER: "PROJECT MANAGER",
    COMPETENT_PERSON: "COMPETENT PERSON",
};

export class AuthService {

    userRepository: AuthUserRepository;
    credentialRepository: AuthCredentialsRepository;
    deviceRepository: AuthDeviceRepository; 
    constructor() {
        this.userRepository = new AuthUserRepository();
        this.credentialRepository = new AuthCredentialsRepository();
        this.deviceRepository = new AuthDeviceRepository(); 
    }

    // -----------------------------
    // REGISTER
    // -----------------------------
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

        // 2. PASSWORD
        const hashedPassword = await bcrypt.hash(data.password, 10);

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

        // 4. COMPANY (SUB ADMIN)
        let companyId: string | null = null;

        if (data.userType === User.SUB_ADMIN) {
            const cmpId = generateCompanyId();

            await this.userRepository.create({
                authUserId: user.id,
                companyId: cmpId,
                userType: User.SUB_ADMIN
            });

            companyId = cmpId;
        }

        return {
            message: "User registered successfully",
            data: {
                id: Number(user.id),
                name: user.name,
                email: data.email,
                mobileNumber: user.mobileNumber,
                countryCode: user.countryCode,
                addressLine: user.addressLine,
                latitude: user.latitude,
                longitude: user.longitude,
                userType: user.userType,
                ...(data.userType === User.SUB_ADMIN && { cmpId: companyId })
            }
        };
    }

    // -----------------------------
    // LOGIN
    // -----------------------------
    async login(data: LoginDTO) {

        const userCred = await this.credentialRepository.findByEmail(data.email);

        if (!userCred) {
            throw createError("Invalid email or password", 401);
        }

        const isValid = await bcrypt.compare(data.password, userCred.password);

        if (!isValid) {
            throw createError("Invalid email or password", 401);
        }

        const user = await this.userRepository.findById(userCred.userId);

        if (!user || user.isDeleted || !user.isVerified || user.status !== "ACTIVE") {
            throw createError("User not active or not found", 403);
        }

        // COMPANY
        let company = null;

        if (
            user.userType === User.PROJECT_MANAGER ||
            user.userType === User.COMPETENT_PERSON
        ) {
            company = await this.userRepository.findByUserId(user.id);
        }

        // DEVICE
        if (data.deviceToken) {
            const existingDevice = await this.deviceRepository.findExistingDevice(user.id, data.deviceToken);

            if (existingDevice) {
                await this.deviceRepository.update(existingDevice.id, {
                    deviceType: data.deviceType,
                    deviceName: data.deviceName,
                    appVersion: data.appVersion,
                    osVersion: data.osVersion,
                    user_type: user.userType,
                    isActive: true,
                    lastLogin: new Date()
                });
            } else {
                await this.deviceRepository.create({
                    auth_userId: user.id,
                    user_type: user.userType,
                    deviceToken: data.deviceToken,
                    deviceType: data.deviceType,
                    deviceName: data.deviceName,
                    appVersion: data.appVersion,
                    osVersion: data.osVersion,
                    isActive: true,
                    lastLogin: new Date()
                });
            }
        }

        // JWT
        const payload: any = {
            sub: String(user.id),
            email: userCred.email,
            role: user.userType
        };

        if (company) payload.cmpId = company.companyId;

        const refreshToken = jwt.sign(
            {
                sub: String(user.id),
                role: user.userType,
                type: "refresh"
            },
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as SignOptions
        );

        await this.credentialRepository.updateLastLogin(data.email);

        return {
            message: "Login successful",
            data: {
                id: Number(user.id),
                name: user.name,
                email: userCred.email,
                userType: user.userType,
                refreshToken,
                ...(company && { cmpId: company.companyId })
            }
        };
    }

    // -----------------------------
    // LOGOUT
    // -----------------------------
    async logout(userId: number, data: { deviceToken: string }) {

        if (!data.deviceToken) {
            throw createError("deviceToken is required", 400);
        }

        const uid = BigInt(userId);

        const activeDevice = await this.deviceRepository.findActiveDevice(uid, data.deviceToken);

        if (!activeDevice) {
            return {
                message: "Already logged out or device not found",
                data: null
            };
        }

        await this.deviceRepository.logoutDevice(activeDevice.id);

        return {
            message: "Logout successful",
            data: data.deviceToken
        };
    }
}
