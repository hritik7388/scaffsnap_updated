import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
    sub?:string;
    userRole?: string;
    token?: string;
  }
}

export {};