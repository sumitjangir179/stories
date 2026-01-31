import { db } from "@/db/index.ts";
import { logger } from "@/middlewares/logger.middleware.ts";
import { usersTable } from "@/models/user.model.ts";
import { ApiError } from "@/utils/ApiError.ts";
import { ApiResponse } from "@/utils/ApiResponse.ts";
import { asyncHandler } from "@/utils/asyncHandler.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
    signInSchema,
    updateUserSchema,
} from "@/validations/user.validation.ts";
import jwt from "jsonwebtoken";

const options = { httpOnly: true, secure: true, sameSite: "strict" as const };

const generateAccessAndRefreshToken = async (userId: string) => {
    try {
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);

        if (!user) throw new ApiError(404, "User not found");

        const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET!,
            {
                expiresIn: "1d",
            },
        );
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET!,
            {
                expiresIn: "7d",
            },
        );

        await db
            .update(usersTable)
            .set({ refreshToken })
            .where(eq(usersTable.id, userId));

        return { accessToken, refreshToken };
    } catch (error: any) {
        logger.error(
            `Error while generating referesh and access token ${error.message}`,
        );
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token",
        );
    }
};

const signIn = asyncHandler(async (req, res) => {
    logger.info(`Logging in user with email ${req.body.email}`);

    const validationResult = await signInSchema.safeParseAsync(req.body);

    if (!validationResult.success)
        throw new ApiError(400, validationResult.error.issues[0].message);

    const { email, password } = validationResult.data;

    let user: any;

    [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);

        [user] = await db
            .insert(usersTable)
            .values({ email, password: hashedPassword })
            .returning();
    } else {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user.id!,
    );


    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, "User logged in successfully", {
                accessToken,
                refreshToken,
            }),
        );
});

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "User profile fetched successfully", req.user));
});

const updateUser = asyncHandler(async (req, res) => {
    const id = req.user?.id;

    if (!id) throw new ApiError(401, "Unauthorized request");

    const validationResult = await updateUserSchema.safeParseAsync(req.body);

    if (!validationResult.success)
        throw new ApiError(400, validationResult.error.issues[0].message);

    const { avatar, userName } = validationResult.data;

    await db
        .update(usersTable)
        .set({ avatar, userName, isNewUser: false })
        .where(eq(usersTable.id, id))
        .returning();

    return res
        .status(200)
        .json(new ApiResponse(200, "User profile updated successfully", {}));
});

const signOut = asyncHandler(async (req, res) => {
    const id = req.user?.id;

    if (!id) throw new ApiError(401, "Unauthorized request");

    await db
        .update(usersTable)
        .set({ refreshToken: "" })
        .where(eq(usersTable.id, id));

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully", {}));
});

export { signIn, currentUser, updateUser, signOut };
