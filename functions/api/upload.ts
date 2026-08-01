/// <reference path="../env.d.ts" />

interface Env {
  ADMIN_PASSWORD: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
}

interface UploadBody {
  password?: string;
  path?: string;
  content?: string;
  message?: string;
}

const DOCS_ROOT = "src/content/docs";
const ALLOWED_EXTENSIONS = [".md", ".mdx"];

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
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

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function normalizeDocsPath(rawPath: string): string | null {
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

function ensureFrontmatter(content: string, relativePath: string): string {
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

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const { env } = context;

  if (!env.ADMIN_PASSWORD || !env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return json(500, {
      error: "Server is missing required environment variables.",
    });
  }

  let body: UploadBody;
  try {
    body = (await context.request.json()) as UploadBody;
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return json(401, { error: "Invalid password." });
  }

  if (typeof body.path !== "string" || typeof body.content !== "string") {
    return json(400, { error: "Both path and content are required." });
  }

  const relativePath = normalizeDocsPath(body.path);
  if (!relativePath) {
    return json(400, {
      error:
        "Invalid path. Use a relative path under docs ending in .md or .mdx (no ..).",
    });
  }

  if (!body.content.trim()) {
    return json(400, { error: "Content must not be empty." });
  }

  const content = ensureFrontmatter(body.content, relativePath);
  const fullPath = `${DOCS_ROOT}/${relativePath}`;
  const branch = env.GITHUB_BRANCH || "master";
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${fullPath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "sdeway-admin-upload",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  let existingSha: string | undefined;
  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
    headers,
  });

  if (getRes.status === 200) {
    const existing = (await getRes.json()) as { sha?: string };
    if (existing.sha) {
      existingSha = existing.sha;
    }
  } else if (getRes.status !== 404) {
    const detail = await getRes.text();
    return json(502, {
      error: "Failed to check existing file on GitHub.",
      detail,
    });
  }

  const message =
    (typeof body.message === "string" && body.message.trim()) ||
    `${existingSha ? "Update" : "Add"} ${relativePath}`;

  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      content: toBase64(content),
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  });

  if (!putRes.ok) {
    const detail = await putRes.text();
    return json(502, {
      error: "Failed to commit file to GitHub.",
      detail,
    });
  }

  const result = (await putRes.json()) as {
    content?: { html_url?: string; path?: string };
    commit?: { html_url?: string; sha?: string };
  };

  return json(200, {
    ok: true,
    updated: Boolean(existingSha),
    path: result.content?.path ?? fullPath,
    commitUrl: result.commit?.html_url,
    fileUrl: result.content?.html_url,
    commitSha: result.commit?.sha,
    note: "Cloudflare Pages will rebuild after the push; the page goes live when that build finishes.",
  });
};
