import prisma from "../config/prismaClient";

export class AuthDeviceRepository {
    constructor() {}

    async create(data: any) {
        return prisma.authDevice.create({
            data
        });
    }

    async findSuperAdminDevice(userId: number) {
        return prisma.authDevice.findFirst({
            where: {
                auth_userId: userId,
                deviceToken: { not: null }
            }
        });
    }
}