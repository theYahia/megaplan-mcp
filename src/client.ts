const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getBaseUrl(): string {
  const domain = process.env.MEGAPLAN_DOMAIN;
  if (!domain) throw new Error("MEGAPLAN_DOMAIN is not set");
  const clean = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${clean}/api/v3`;
}

function getToken(): string {
  const token = process.env.MEGAPLAN_TOKEN;
  if (!token) throw new Error("MEGAPLAN_TOKEN is not set");
  return token;
}

export async function megaplanGet(path: string, params?: Record<string, string>): Promise<unknown> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return megaplanRequest("GET", `${path}${query}`);
}

export async function megaplanPost(path: string, body: unknown): Promise<unknown> {
  return megaplanRequest("POST", path, body);
}

async function megaplanRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${getBaseUrl()}${path}`, {
        method,
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[megaplan-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text();
      throw new Error(`Megaplan HTTP ${response.status}: ${text}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[megaplan-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Megaplan: all retries exhausted");
}
