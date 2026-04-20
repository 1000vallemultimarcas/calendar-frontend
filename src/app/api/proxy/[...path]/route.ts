import type { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const API_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_API_PREFIX ||
  process.env.BACKEND_API_PREFIX ||
  "";

function buildTargetUrl(path: string[], search: string) {
  const normalizedPrefix = API_PREFIX
    ? API_PREFIX.startsWith("/")
      ? API_PREFIX
      : `/${API_PREFIX}`
    : "";
  const normalizedPath = path.length > 0 ? `/${path.join("/")}` : "";

  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPrefix}${normalizedPath}${search}`;
}

async function forwardRequest(
  request: NextRequest,
  path: string[] | undefined,
) {
  const targetUrl = buildTargetUrl(path ?? [], request.nextUrl.search);
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "follow",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forwardRequest(request, path);
}
