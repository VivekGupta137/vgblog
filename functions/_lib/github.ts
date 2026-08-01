/// <reference path="../env.d.ts" />

export interface Env {
  ADMIN_PASSWORD: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
}

export const DOCS_ROOT = "src/content/docs";
export const ALLOWED_EXTENSIONS = [".md", ".mdx"];
export const COMMIT_PREFIX = "[WEB]";

/** Ensures UI commits are tagged; does not double-prefix if already present. */
export function formatCommitMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return COMMIT_PREFIX;
  if (trimmed.startsWith(COMMIT_PREFIX)) return trimmed;
  return `${COMMIT_PREFIX} ${trimmed}`;
}

export function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const len = Math.max(aBytes.length, bBytes.length);
  let mismatch = aBytes.length === bBytes.length ? 0 : 1;

  for (let i = 0; i < len; i++) {
    const av = i < aBytes.length ? aBytes[i]! : 0;
    const bv = i < bBytes.length ? bBytes[i]! : 0;
    mismatch |= av ^ bv;
  }

  return mismatch === 0;
}

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function fromBase64(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function normalizeDocsPath(rawPath: string): string | null {
  const trimmed = rawPath.trim().replace(/\\/g, "/");
  if (!trimmed || trimmed.startsWith("/") || trimmed.includes("..")) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return null;
  }

  const segments = trimmed.split("/").filter(Boolean);
  if (segments.length === 0 || segments.some((s) => s === "." || s === "..")) {
    return null;
  }

  return segments.join("/");
}

export function ensureFrontmatter(content: string, relativePath: string): string {
  const trimmed = content.trimStart();
  if (trimmed.startsWith("---")) {
    const end = trimmed.indexOf("\n---", 3);
    if (end !== -1) {
      const frontmatter = trimmed.slice(0, end);
      if (/^title\s*:/m.test(frontmatter) || /\ntitle\s*:/m.test(frontmatter)) {
        return content;
      }
    }
  }

  const fileName = relativePath.split("/").pop() ?? "untitled.md";
  const title = fileName
    .replace(/\.(md|mdx)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `---\ntitle: ${title}\n---\n\n${content.trimStart()}`;
}

export function requireEnv(env: Env): Response | null {
  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return json(500, { error: "Server is missing required environment variables." });
  }
  return null;
}

export function githubHeaders(env: Env): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "sdeway-admin-docs",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export function branchName(env: Env): string {
  return env.GITHUB_BRANCH || "master";
}

export function contentsUrl(env: Env, fullPath: string): string {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${fullPath}`;
}

export function repoApi(env: Env, suffix: string): string {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${suffix}`;
}

export async function getFile(
  env: Env,
  relativePath: string,
): Promise<{ sha: string; content: string; path: string } | { error: Response } | null> {
  const fullPath = `${DOCS_ROOT}/${relativePath}`;
  const res = await fetch(`${contentsUrl(env, fullPath)}?ref=${encodeURIComponent(branchName(env))}`, {
    headers: githubHeaders(env),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    return {
      error: json(502, {
        error: "Failed to read file from GitHub.",
        detail: await res.text(),
      }),
    };
  }

  const data = (await res.json()) as {
    sha?: string;
    content?: string;
    encoding?: string;
    path?: string;
    type?: string;
  };

  if (data.type !== "file" || !data.sha || !data.content) {
    return { error: json(400, { error: "Path is not a file." }) };
  }

  const raw = data.encoding === "base64" ? fromBase64(data.content.replace(/\n/g, "")) : data.content;
  return { sha: data.sha, content: raw, path: data.path ?? fullPath };
}
