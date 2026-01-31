import 'dotenv/config';
import app from "@/app.ts";
import { logger } from '@/middlewares/logger.middleware.ts';


const port = process.env.PORT || 3001;

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});