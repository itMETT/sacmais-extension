import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const api = axios.create({
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
});

api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response?.status === 401) window.parent.postMessage({ type: "RELOAD" }, "*");
		return Promise.reject(error);
	},
);

api.interceptors.request.use(
	(config) => {
		const token = (config.headers.Authorization as string).split(" ").pop()!;
		checkAndRefreshToken(token);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export function setupAxios(token: string, baseURL: string) {
	api.defaults.headers.common.Authorization = `Bearer ${token}`;
	api.defaults.baseURL = baseURL;
}

async function checkAndRefreshToken(token: string): Promise<void> {
	try {
		const decoded = jwtDecode<{ exp: number }>(token);
		const currentTime = Math.floor(Date.now() / 1000);
		const timeUntilExpiry = decoded.exp - currentTime;
		const FIFTEEN_MINUTES = 15 * 60;

		if (timeUntilExpiry > FIFTEEN_MINUTES) return;

		const response = await axios.post("/auth/refresh_token");
		const newToken = response.data.token;
		api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
	} catch (_error) {
		window.location.reload();
	}
}
