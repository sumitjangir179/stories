import { db } from "@/db/index.ts";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { JwtPayload } from "jsonwebtoken"
import { usersTable } from "@/models/user.model.ts";
import { eq } from "drizzle-orm";

interface DecodedTokenType extends JwtPayload {
    id: string;
}

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) throw new ApiError(401, "Unauthorized request")

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        ) as DecodedTokenType;

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, decodedToken?.id))
            .limit(1);

        if (!user) throw new ApiError(401, "Invalid Access Token")

        if (user.id !== decodedToken.id) throw new ApiError(401, "You are not authorized to perform this action")

        const { password: _, refreshToken: __, ...safeUser } = user;

        req.user = safeUser;

        next()
    } catch (error: any) {
        throw new ApiError(401, error.message || "Invalid access token")
    }

})