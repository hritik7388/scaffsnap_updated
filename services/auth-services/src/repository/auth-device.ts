import prisma from "../config/prismaClient";

// ----------------------------
export class AuthDeviceRepository {

    async findActiveDevice(userId: bigint, deviceToken: string) {
        return prisma.authDevice.findFirst({
            where: {
                auth_userId: userId,
                deviceToken,
                isActive: true
            }
        });
    }

    async findExistingDevice(userId: bigint, deviceToken: string) {
        return prisma.authDevice.findFirst({
            where: {
                auth_userId: userId,
                deviceToken
            }
        });
    }

    async create(data: any) {
        return prisma.authDevice.create({ data });
    }

    async update(id: bigint, data: any) {
        return prisma.authDevice.update({
            where: { id },
            data
        });
    }

    async logoutDevice(id: bigint) {
        return prisma.authDevice.update({
            where: { id },
            data: {
                deviceToken: null,
                isActive: false,
                lastLogin: new Date()
            }
        });
    }
}
