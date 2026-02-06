import z from "zod";

export const uploadSchema = z.object({
    fileName: z.string().min(1, "Filename is required"),

    context: z.enum(["status", "profile", "chat"]),

    mimeType: z
        .string()
        .refine(
            (val: string) => val.startsWith("image/") || val.startsWith("video/"),
            {
                message: "Invalid file type. Must be an image or video.",
            },
        ),
});
