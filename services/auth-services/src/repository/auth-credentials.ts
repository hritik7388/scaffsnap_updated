import prisma from "../config/prismaClient";

export class AuthCredentialsRepository {

    async create(data: any) {
        return prisma.authCredentials.create({ data });
    }

    async findByEmail(email: string) {
        return prisma.authCredentials.findFirst({
            where: { email }
        });
    }

    async updateLastLogin(email: string) {
        return prisma.authCredentials.update({
            where: { email },
            data: { lastLogin: new Date() }
        });
    }
}
