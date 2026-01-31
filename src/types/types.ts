import { usersTable } from "@/models/user.model.ts";

type SafeUser = Omit<typeof usersTable.$inferSelect, "password" | "refreshToken">;

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}