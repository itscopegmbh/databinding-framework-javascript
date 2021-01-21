async function http<T>(request: RequestInfo, config: RequestInit): Promise<T> {
	const response = await fetch(request, config);

	if (!response.ok) {
		throw new Error(response.status + ': ' + response.statusText);
	}

	return response.json().catch(() => ({}));
}

export async function get<T>(path: string, config?: RequestInit): Promise<T> {
	const init = { method: 'get', ...config };
	return await http<T>(path, init);
}

export async function post<T, U>(path: string, body: T, config?: RequestInit): Promise<U> {
	const init = { method: 'post', body: JSON.stringify(body), ...config };
	return await http<U>(path, init);
}

export async function put<T, U>(path: string, body: T, config?: RequestInit): Promise<U> {
	const init = { method: 'put', body: JSON.stringify(body), ...config };
	return await http<U>(path, init);
}
