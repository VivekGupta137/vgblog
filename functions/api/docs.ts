/// <reference path="../env.d.ts" />

import {
  DOCS_ROOT,
  branchName,
  contentsUrl,
  ensureFrontmatter,
  formatCommitMessage,
  getFile,
  githubHeaders,
  json,
  normalizeDocsPath,
  repoApi,
  requireEnv,
  timingSafeEqual,
  toBase64,
  type Env,
} from "../_lib/github";

type Action = "list" | "get" | "upsert" | "delete" | "move";

interface DocsBody {
  password?: string;
  action?: Action;
  path?: string;
  from?: string;
  to?: string;
  content?: string;
  message?: string;
}

const REBUILD_NOTE =
  "Cloudflare Pages will rebuild after the push; the page goes live when that build finishes.";

function auth(env: Env, password: unknown): Response | null {
  const missing = requireEnv(env);
  if (missing) return missing;
  if (typeof password !== "string" || !timingSafeEqual(password, env.ADMIN_PASSWORD)) {
    return json(401, { error: "Invalid password." });
  }
  return null;
}

async function listDocs(env: Env): Promise<Response> {
  const branch = branchName(env);
  const res = await fetch(repoApi(env, `/git/trees/${encodeURIComponent(branch)}?recursive=1`), {
    headers: githubHeaders(env),
  });

  if (!res.ok) {
    return json(502, {
      error: "Failed to list docs from GitHub.",
      detail: await res.text(),
    });
  }

  const data = (await res.json()) as {
    tree?: Array<{ path?: string; type?: string }>;
    truncated?: boolean;
  };

  const prefix = `${DOCS_ROOT}/`;
  const files = (data.tree ?? [])
    .filter((item) => item.type === "blob" && item.path?.startsWith(prefix))
    .map((item) => item.path!.slice(prefix.length))
    .filter((path) => /\.(md|mdx)$/i.test(path) && !path.includes(".."))
    .sort((a, b) => a.localeCompare(b));

  return json(200, {
    ok: true,
    files,
    truncated: Boolean(data.truncated),
    branch,
  });
}

async function getDoc(env: Env, pathRaw: unknown): Promise<Response> {
  if (typeof pathRaw !== "string") {
    return json(400, { error: "path is required." });
  }
  const relativePath = normalizeDocsPath(pathRaw);
  if (!relativePath) {
    return json(400, { error: "Invalid path." });
  }

  const file = await getFile(env, relativePath);
  if (!file) return json(404, { error: "File not found." });
  if ("error" in file) return file.error;

  return json(200, {
    ok: true,
    path: relativePath,
    fullPath: file.path,
    content: file.content,
    sha: file.sha,
  });
}

async function upsertDoc(env: Env, body: DocsBody): Promise<Response> {
  if (typeof body.path !== "string" || typeof body.content !== "string") {
    return json(400, { error: "Both path and content are required." });
  }

  const relativePath = normalizeDocsPath(body.path);
  if (!relativePath) {
    return json(400, {
      error: "Invalid path. Use a relative path under docs ending in .md or .mdx (no ..).",
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
    action: existingSha ? "updated" : "created",
    path: result.content?.path ?? fullPath,
    commitUrl: result.commit?.html_url,
    fileUrl: result.content?.html_url,
    commitSha: result.commit?.sha,
    note: REBUILD_NOTE,
  });
}

async function deleteDoc(env: Env, body: DocsBody): Promise<Response> {
  if (typeof body.path !== "string") {
    return json(400, { error: "path is required." });
  }

  const relativePath = normalizeDocsPath(body.path);
  if (!relativePath) {
    return json(400, { error: "Invalid path." });
  }

  const file = await getFile(env, relativePath);
  if (!file) return json(404, { error: "File not found." });
  if ("error" in file) return file.error;

  const fullPath = `${DOCS_ROOT}/${relativePath}`;
  const message = formatCommitMessage(
    (typeof body.message === "string" && body.message.trim()) || `Delete ${relativePath}`,
  );

  const delRes = await fetch(contentsUrl(env, fullPath), {
    method: "DELETE",
    headers: githubHeaders(env),
    body: JSON.stringify({
      message,
      sha: file.sha,
      branch: branchName(env),
    }),
  });

  if (!delRes.ok) {
    return json(502, {
      error: "Failed to delete file on GitHub.",
      detail: await delRes.text(),
    });
  }

  const result = (await delRes.json()) as {
    commit?: { html_url?: string; sha?: string };
  };

  return json(200, {
    ok: true,
    action: "deleted",
    path: fullPath,
    commitUrl: result.commit?.html_url,
    commitSha: result.commit?.sha,
    note: REBUILD_NOTE,
  });
}

async function moveDoc(env: Env, body: DocsBody): Promise<Response> {
  if (typeof body.from !== "string" || typeof body.to !== "string") {
    return json(400, { error: "Both from and to paths are required." });
  }

  const fromPath = normalizeDocsPath(body.from);
  const toPath = normalizeDocsPath(body.to);
  if (!fromPath || !toPath) {
    return json(400, { error: "Invalid from/to path." });
  }
  if (fromPath === toPath) {
    return json(400, { error: "from and to paths must be different." });
  }

  const source = await getFile(env, fromPath);
  if (!source) return json(404, { error: "Source file not found." });
  if ("error" in source) return source.error;

  const dest = await getFile(env, toPath);
  if (dest && !("error" in dest)) {
    return json(409, { error: "Destination already exists. Delete or choose another path." });
  }
  if (dest && "error" in dest) return dest.error;

  const branch = branchName(env);
  const headers = githubHeaders(env);
  const message = formatCommitMessage(
    (typeof body.message === "string" && body.message.trim()) || `Move ${fromPath} → ${toPath}`,
  );

  // Single commit via Git Data API: create blob at new path, rebuild tree without old path, update ref.
  const refRes = await fetch(repoApi(env, `/git/ref/heads/${encodeURIComponent(branch)}`), {
    headers,
  });
  if (!refRes.ok) {
    return json(502, { error: "Failed to read branch ref.", detail: await refRes.text() });
  }
  const refData = (await refRes.json()) as { object?: { sha?: string } };
  const headSha = refData.object?.sha;
  if (!headSha) {
    return json(502, { error: "Branch tip SHA missing." });
  }

  const commitRes = await fetch(repoApi(env, `/git/commits/${headSha}`), { headers });
  if (!commitRes.ok) {
    return json(502, { error: "Failed to read commit.", detail: await commitRes.text() });
  }
  const commitData = (await commitRes.json()) as { tree?: { sha?: string } };
  const baseTreeSha = commitData.tree?.sha;
  if (!baseTreeSha) {
    return json(502, { error: "Base tree SHA missing." });
  }

  const blobRes = await fetch(repoApi(env, "/git/blobs"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      content: toBase64(source.content),
      encoding: "base64",
    }),
  });
  if (!blobRes.ok) {
    return json(502, { error: "Failed to create blob.", detail: await blobRes.text() });
  }
  const blobData = (await blobRes.json()) as { sha?: string };
  if (!blobData.sha) {
    return json(502, { error: "Blob SHA missing." });
  }

  const treeRes = await fetch(repoApi(env, "/git/trees"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        {
          path: `${DOCS_ROOT}/${fromPath}`,
          mode: "100644",
          type: "blob",
          sha: null,
        },
        {
          path: `${DOCS_ROOT}/${toPath}`,
          mode: "100644",
          type: "blob",
          sha: blobData.sha,
        },
      ],
    }),
  });
  if (!treeRes.ok) {
    return json(502, { error: "Failed to create tree for move.", detail: await treeRes.text() });
  }
  const treeData = (await treeRes.json()) as { sha?: string };
  if (!treeData.sha) {
    return json(502, { error: "Tree SHA missing." });
  }

  const newCommitRes = await fetch(repoApi(env, "/git/commits"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [headSha],
    }),
  });
  if (!newCommitRes.ok) {
    return json(502, { error: "Failed to create move commit.", detail: await newCommitRes.text() });
  }
  const newCommit = (await newCommitRes.json()) as {
    sha?: string;
    html_url?: string;
  };
  if (!newCommit.sha) {
    return json(502, { error: "Commit SHA missing." });
  }

  const updateRefRes = await fetch(repoApi(env, `/git/refs/heads/${encodeURIComponent(branch)}`), {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommit.sha }),
  });
  if (!updateRefRes.ok) {
    return json(502, {
      error: "Failed to update branch after move.",
      detail: await updateRefRes.text(),
    });
  }

  return json(200, {
    ok: true,
    action: "moved",
    from: `${DOCS_ROOT}/${fromPath}`,
    to: `${DOCS_ROOT}/${toPath}`,
    commitUrl: newCommit.html_url,
    commitSha: newCommit.sha,
    note: REBUILD_NOTE,
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return json(405, { error: "Method not allowed. Use POST." });
  }

  let body: DocsBody;
  try {
    body = (await context.request.json()) as DocsBody;
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const denied = auth(context.env, body.password);
  if (denied) return denied;

  const action = body.action ?? "upsert";

  switch (action) {
    case "list":
      return listDocs(context.env);
    case "get":
      return getDoc(context.env, body.path);
    case "upsert":
      return upsertDoc(context.env, body);
    case "delete":
      return deleteDoc(context.env, body);
    case "move":
      return moveDoc(context.env, body);
    default:
      return json(400, {
        error: "Unknown action. Use list, get, upsert, delete, or move.",
      });
  }
};
