import z from "zod";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const updateUserSchema = z.object({
    userName: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters"),

    avatar: z.url(),
});
