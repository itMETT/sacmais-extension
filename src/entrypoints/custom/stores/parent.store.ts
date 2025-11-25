import { create } from "zustand";

export type ParentStore = {
	token: string;
	baseURL: string;
	init(): void;
};

export const useParentStore = create<ParentStore>((set) => ({
	token: "",
	baseURL: "",
	init() {
		window.parent.postMessage({ type: "GET_PARENT_DATA" }, "*");

		window.addEventListener("message", ({ data = {} }) => {
			if (data?.type === "SEND_PARENT_DATA") set({ token: data.payload.token, baseURL: data.payload.baseURL });
		});
	},
}));
