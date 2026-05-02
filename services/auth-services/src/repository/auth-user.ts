import prisma from "../config/prismaClient";
// import  from "../config/prisma";

export class AuthUserRepository {
    constructor() {}

    async findById(id: number) {
        return prisma.authUser.findUnique({
            where: { id }
        });
    }

    async create(data: any) {
        return prisma.authUser.create({
            data
        });
    }

    async findSuperAdmins() {
        return prisma.authUser.findMany({
            where: { userType: "SUPER ADMIN" },
            select: { id: true }
        });
    }
    
 
}