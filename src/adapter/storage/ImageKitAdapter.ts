import ImageKit from "imagekit";
import { StorageInterface } from "./StorageInterface.ts";
import { logger } from "@/middlewares/logger.middleware.ts";
import { ApiError } from "@/utils/ApiError.ts";
import crypto, { sign } from "crypto";

export class ImageKitAdapter extends StorageInterface {
    private imagekit: ImageKit;
    private urlEndpoint: string

    constructor() {
        super();
        this.urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT as string

        this.imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            urlEndpoint: this.urlEndpoint,
        });
    }

    async generatePreSignedUrl(fileName: string, context: string, mimeType: string): Promise<object> {
        try {
            const token = crypto.randomBytes(16).toString("hex");
            const expire = Math.floor(Date.now() / 1000) + 300;

            const authParams = this.imagekit.getAuthenticationParameters(token, expire);

            return {
                provider: "imagekit",
                token: authParams.token,
                expireIn: authParams.expire,
                signature: authParams.signature,
                fileName,
                mimeType,
                urlEndpoint: this.urlEndpoint
            }

        } catch (error: any) {
            logger.error(`Error generating pre-signed URL: ${error.message}`);
            throw new ApiError(500, 'Error generating pre-signed URL');
        }

    }
}

