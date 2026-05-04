import prisma from "../config/prismaClient";

// ----------------------------
// USER REPOSITORY
// ----------------------------
export class AuthUserRepository {

    async create(data: any) {
        return prisma.authUser.create({ data });
    }

    async findById(id: bigint) {
        return prisma.authUser.findFirst({
            where: { id, isDeleted: false }
        });
    }

    async findByEmail(email: string) {
        return prisma.authUser.findFirst({
            where: { email, isDeleted: false }
        });
    }

    async findSuperAdmins() {
        return prisma.authUser.findMany({
            where: {
                userType: "SUPER ADMIN",
                isDeleted: false,
                isVerified: true,
                status: "ACTIVE"
            }
        });
    }
    async findByUserId(authUserId: bigint) {
    return prisma.companyIdentity.findUnique({
        where: { authUserId }
    });
}
 
}
