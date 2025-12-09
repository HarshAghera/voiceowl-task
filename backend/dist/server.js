"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const mongoose_1 = require("./database/mongoose");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
async function start() {
    try {
        await (0, mongoose_1.connectDB)();
        app.listen(env_1.PORT, () => {
            console.log(`Server listening on http://localhost:${env_1.PORT}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        (0, mongoose_1.disconnectDB)();
        process.exit(1);
    }
}
start();
