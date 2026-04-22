export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:4000";

const API_PREFIX =
	process.env.NEXT_PUBLIC_BACKEND_API_PREFIX ||
	process.env.BACKEND_API_PREFIX ||
	"";

const TEST_TOKEN = process.env.NEXT_PUBLIC_TEST_MANAGER_TOKEN;

function getClientAuthToken() {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem("token") || TEST_TOKEN;
}

export async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const normalizedPrefix = API_PREFIX
		? API_PREFIX.startsWith("/")
			? API_PREFIX
			: `/${API_PREFIX}`
		: "";
	const backendUrl = `${API_BASE_URL.replace(/\/$/, "")}${normalizedPrefix}${normalizedPath}`;

	// Chamamos o backend diretamente (o proxy do Next.js no servidor causava erros de SSL com certificados autoassinados)
	// O backend já possui CORS habilitado (Access-Control-Allow-Origin: *)
	const url = backendUrl;

	const token = getClientAuthToken();
	const headers = new Headers(init?.headers);

	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	if (token && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	let response: Response;
	try {
		response = await fetch(url, {
			headers,
			cache: "no-store",
			...init,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Erro de rede desconhecido";
		throw new Error(`Falha de conexao com a API: ${message}`);
	}

	if (!response.ok) {
		let bodyText = "";
		try {
			bodyText = await response.text();
			bodyText = bodyText.replace(
				/Não é permitido criar agendamentos com data retroativa\.?/gi,
				"Não é permitido criar agendamentos com data e hora retroativas.",
			);
		} catch {
			bodyText = "";
		}

		let message = bodyText.trim();
		if (message) {
			try {
				const parsed = JSON.parse(message) as { message?: string };
				if (parsed?.message) {
					message = parsed.message;
				}
			} catch {
				// Keep raw message when response is not JSON.
			}
		}

		if (!message) {
			message = `Request failed ${response.status} ${response.statusText}`;
		}

		throw new Error(message);
	}

	if (response.status === 204 || response.status === 205) {
		return undefined as T;
	}

	let bodyText = "";
	try {
		bodyText = await response.text();
	} catch {
		bodyText = "";
	}
	if (!bodyText) {
		return undefined as T;
	}

	try {
		return JSON.parse(bodyText) as T;
	} catch {
		return bodyText as T;
	}
}
