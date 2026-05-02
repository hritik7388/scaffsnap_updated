import prisma from "../config/prismaClient";
export class AuthCredentialsRepository {
    constructor() {}

    async findByEmail(email: string) {
        return prisma.authCredentials.findUnique({
            where: { email }
        });
    }

    async create(data: any) {
        return prisma.authCredentials.create({
            data
        });
    }
}