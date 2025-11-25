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
};

export const useCRMStore = create<CRMStore>((_set) => ({
	boards: [],
	columns: [],
}));
