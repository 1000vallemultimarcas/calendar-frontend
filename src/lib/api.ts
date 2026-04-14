export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:4000";

function getClientAuthToken() {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem("token");
}

export async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
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
