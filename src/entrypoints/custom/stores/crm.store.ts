import { api } from "@/lib/axios";
import { create } from "zustand";

type Board = {
	id: number;
	name: string;
};

type Column = {
	id: number;
	name: string;
	board: Board;
	boardId: Board["id"];
	columnContacts: Array<{ contactId: number }>;
};

export type CRMStore = {
	boards: Array<Board>;
	columns: Array<Column>;
	fetch(): Promise<void>;
};

export const useCRMStore = create<CRMStore>((set) => ({
	boards: [],
	columns: [],
	async fetch() {
		const { data: boards } = await api.get<Array<{ id: number; name: string }>>("/boards/list");

		const boardColumnsQueryParams = boards.map(({ id }) => `boardId=${id}`).join("&");
		const { data: columns } = await api.get(`/board-columns/list?${boardColumnsQueryParams}`);

		set({ boards, columns });
	},
}));
