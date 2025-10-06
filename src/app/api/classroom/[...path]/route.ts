import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_BASE_URL =
  process.env.CLASSROOM_API_TARGET?.replace(/\/$/, "") ??
  "https://cis.kku.ac.th/api/classroom";
const API_KEY = process.env.CLASSROOM_API_KEY;

const passthroughHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  const headersToRemove = [
    "host",
    "content-length",
    "accept-encoding",
    "connection",
    "origin",
    "referer",
  ];

  headersToRemove.forEach((key) => headers.delete(key));
  headers.set("accept", headers.get("accept") ?? "application/json");

  if (API_KEY) {
    headers.set("x-api-key", API_KEY);
  }

  return headers;
};

const buildTargetUrl = (request: NextRequest, pathSegments: string[] = []) => {
  const joinedPath = pathSegments.join("/");
  const targetUrl = new URL(
    `${UPSTREAM_BASE_URL}${joinedPath ? `/${joinedPath}` : ""}`,
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  return targetUrl;
};

const forwardRequest = async (
  request: NextRequest,
  context: { params: { path?: string[] } },
) => {
  const targetUrl = buildTargetUrl(request, context.params.path ?? []);
  const method = request.method.toUpperCase();
  const headers = passthroughHeaders(request);

  const bodyAllowed = !["GET", "HEAD"].includes(method);
  const body = bodyAllowed ? await request.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
};

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
export const HEAD = forwardRequest;
export const OPTIONS = forwardRequest;

export const runtime = "nodejs";
