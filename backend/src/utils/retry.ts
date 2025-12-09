const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 300): Promise<T> {
  let error: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      error = err;
      await sleep(delay * 2 ** i);
    }
  }

  throw error;
}
