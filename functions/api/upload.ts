/// <reference path="../env.d.ts" />

/**
 * Backward-compatible upsert endpoint.
 * Prefer POST /api/docs with { action: "upsert", ... }.
 */
import {
  DOCS_ROOT,
  branchName,
  contentsUrl,
  ensureFrontmatter,
  formatCommitMessage,
  githubHeaders,
  json,
  writeDocsPath,
  requireEnv,
  timingSafeEqual,
  toBase64,
  type Env,
} from "../_lib/github";

interface UploadBody {
  password?: string;
  path?: string;
  content?: string;
  message?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  const { env } = context;
  const missing = requireEnv(env);
  if (missing) return missing;

  let body: UploadBody;
  try {
    body = (await context.request.json()) as UploadBody;
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  if (typeof body.password !== "string" || !timingSafeEqual(body.password, env.ADMIN_PASSWORD)) {
    return json(401, { error: "Invalid password." });
  }

  if (typeof body.path !== "string" || typeof body.content !== "string") {
    return json(400, { error: "Both path and content are required." });
  }

  const relativePath = writeDocsPath(body.path);
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
  const branch = branchName(env);
  const headers = githubHeaders(env);
  const apiBase = contentsUrl(env, fullPath);

  let existingSha: string | undefined;
  const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });

  if (getRes.status === 200) {
    const existing = (await getRes.json()) as { sha?: string };
    existingSha = existing.sha;
  } else if (getRes.status !== 404) {
    return json(502, {
      error: "Failed to check existing file on GitHub.",
      detail: await getRes.text(),
    });
  }

  const message = formatCommitMessage(
    (typeof body.message === "string" && body.message.trim()) ||
      `${existingSha ? "Update" : "Add"} ${relativePath}`,
  );

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
    return json(502, {
      error: "Failed to commit file to GitHub.",
      detail: await putRes.text(),
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
