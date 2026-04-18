const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function callGeminiWithRetry(
  model: any,
  payload: any,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(payload);
    } catch (err: any) {
      if (err?.status === 503 || err?.message?.includes("UNAVAILABLE")) {
        console.log(`Retrying Gemini... attempt ${i + 1}`);
        await sleep(1500 * (i + 1));
      } else {
        throw err;
      }
    }
  }

  throw new Error("Gemini failed after retries");
}