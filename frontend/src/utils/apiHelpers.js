// utils/apiHelpers.js
import axiosInstance from './axiosClient';

/**
 * Helper: attempt request with simple retry loop
 */
export async function withRetry(fn, retries = 2, delayMs = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

/**
 * Helper: upload files with concurrency limit
 */
export async function uploadFilesConcurrently(files, endpoint, formFieldName = 'image_file', options = {}) {
  const concurrency = options.concurrency ?? 3;
  const timeout = options.timeout ?? 120000; // 2 minutes per file as default
  const additionalFields = options.additionalFields ?? {};
  const results = [];
  const queue = files.slice();
  
  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift();
      const formData = new FormData();
      formData.append(formFieldName, file);
      // Append any additional fields (e.g., demo_mode)
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const res = await withRetry(() => axiosInstance.post(endpoint, formData, { timeout }), 2, 1000);
      results.push(res.data.stage_filename);
    }
  }
  
  const workers = [];
  for (let i = 0; i < concurrency; i++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

