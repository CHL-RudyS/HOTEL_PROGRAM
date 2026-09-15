import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    homePropertyId: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      homePropertyId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
    homePropertyId?: string;
  }
}
