type RequestOptions = {
  headers?: Record<string, string>;
  body?: string;
};

async function request(
  url: string,
  options: RequestOptions & { method: string }
) {
  let body: any;
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  try {
    body = options.body;
    headers["Content-Type"] = headers["Content-Type"] || "application/json";

    const response = await fetch(url, {
      method: options.method,
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const expectedError = response.status >= 400 && response.status < 500;

      if (!expectedError) {
        console.log({ error });
        console.log("Unexpected error occurs");
      }

      return Promise.reject({ status: response.status, ...error });
    }

    return { data: await response.json() };
  } catch (error) {
    console.log("Network or unexpected error:", error);
    return Promise.reject(error);
  }
}

export default {
  get: (url: string, options?: RequestOptions) =>
    request(url, { ...options, method: "GET" }),
  post: (url: string, body?: string, options?: RequestOptions) =>
    request(url, { ...options, method: "POST", body }),
  put: (url: string, body?: string, options?: RequestOptions) =>
    request(url, { ...options, method: "PUT", body }),
  delete: (url: string, options?: RequestOptions) =>
    request(url, { ...options, method: "DELETE" }),
};
