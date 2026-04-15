export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:4000";

const API_PREFIX =
	process.env.NEXT_PUBLIC_BACKEND_API_PREFIX ||
	process.env.BACKEND_API_PREFIX ||
	"";

function getClientAuthToken() {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem("token");
}

export async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const normalizedPrefix = API_PREFIX
		? API_PREFIX.startsWith("/")
			? API_PREFIX
			: `/${API_PREFIX}`
		: "";
	const url = `${API_BASE_URL.replace(/\/$/, "")}${normalizedPrefix}${normalizedPath}`;
	const token = getClientAuthToken();
	const headers = new Headers(init?.headers);

	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const response = await fetch(url, {
		headers,
		cache: "no-store",
		...init,
	});

	if (!response.ok) {
		const bodyText = await response.text();
		throw new Error(`Request failed ${response.status} ${response.statusText}: ${bodyText}`);
	}

	return response.json();
}
