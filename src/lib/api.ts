const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "/api/classroom";

const buildUrl = (path: string) => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

interface RequestOptions extends RequestInit {
  token?: string;
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}) => {
  const { token, headers, ...rest } = options;

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
  }

  return (await response.json()) as T;
};
