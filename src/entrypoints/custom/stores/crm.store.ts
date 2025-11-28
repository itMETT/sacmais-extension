import { api } from "@/lib/axios";
import { create } from "zustand";

export type Contact = {
	id: number;
	name: string;
	number: string;
	tags: Array<Tag>;
};

type Board = {
	id: number;
	name: string;
};

export type Tag = {
	id: number;
	name: string;
	color: string;
};

type Column = {
	id: number;
	name: string;
	board: Board;
	boardId: Board["id"];
	columnContacts: Array<{ contactId: number }>;
};

export type CRMStore = {
	tags: Array<Tag>;
	columns: Array<Column>;
	fetch(): Promise<void>;
};

export const useCRMStore = create<CRMStore>((set) => ({
	tags: [],
	columns: [],
	async fetch() {
		const { data: boards } = await api.get<Array<Board>>("/boards/list");

		const boardColumnsQueryParams = boards.map(({ id }) => `boardId=${id}`).join("&");
		const { data: columns } = await api.get<Array<Column>>(`/board-columns/list?${boardColumnsQueryParams}`);

		const { data: tags } = await api.get<Array<Tag>>(`/tags/list`);

		set({ tags, columns });
	},
}));
