"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = retry;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function retry(fn, attempts = 3, delay = 300) {
    let error;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch (err) {
            error = err;
            await sleep(delay * 2 ** i);
        }
    }
    throw error;
}
