import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { type Contact, useCRMStore } from "../../stores/crm.store";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfirmChanges } from "@/components/confirm-changes";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/axios";
import type { Dispatch, SetStateAction } from "react";
import { Combobox } from "@/components/ui/combobox";

const defaultPlaceholder = "Pesquise uma coluna";
const defaultNotFoundMessage = "Nenhuma coluna encontrada";

export function ExportColumns() {
	const [selectedColumnIds, setSelectedColumnIds] = useState<Array<number>>([]);
	const [fetchedContacts, setFetchedContacts] = useState<Array<Contact>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const columns = useCRMStore((state) => state.columns);
	const comboboxEntries = useMemo(
		() => columns.map(({ id, name, board }) => ({ id, name, group: board.name })),
		[columns],
	);
	const selectedColumns = useMemo(
		() => selectedColumnIds.map((id) => columns.find((column) => column.id === id)!),
		[selectedColumnIds],
	);

	const handleOnSelect = useCallback(
		(id: number) => {
			setSelectedColumnIds((state) => (state.find((stateId) => stateId === id) ? state : [...state, id]));
		},
		[setSelectedColumnIds],
	);

	const handleRemove = useCallback(
		(id: number) => {
			setSelectedColumnIds((state) => {
				const stateSet = new Set(state);
				stateSet.delete(id);
				return Array.from(stateSet);
			});
		},
		[setSelectedColumnIds],
	);

	const selectedContactIds = useMemo(
		() =>
			selectedColumnIds.flatMap((id) => {
				const column = columns.find((column) => column.id === id)!;
				const contactId = column.columnContacts.map(({ contactId }) => contactId);
				return contactId;
			}),
		[selectedColumnIds, columns],
	);

	const handleExport = useCallback(async () => {
		setIsLoading(true);

		const contacts = await fetchContacts(selectedContactIds, setFetchedContacts);
		await downloadExcel(contacts);
		setIsLoading(false);
	}, [setIsLoading, selectedContactIds, setFetchedContacts]);

	const progress = useMemo(
		() => (fetchedContacts.length * 100) / (selectedContactIds.length || 1),
		[fetchedContacts, selectedContactIds],
	);

	const handleReset = useCallback(() => {
		setFetchedContacts([]);
		setSelectedColumnIds([]);
	}, [setFetchedContacts, setIsLoading]);

	return (
		<div className="flex flex-col flex-1">
			<div className="flex flex-col gap-2">
				<Card>
					<CardHeader className="flex flex-row flex-wrap">
						<div>
							<CardTitle className="text-[1.2rem]">Exportar colunas</CardTitle>
							<CardDescription>Adicione as colunas que deseja exportar</CardDescription>
						</div>

						<div className="flex items-center justify-center ml-auto">
							<Tooltip>
								<TooltipTrigger>
									<Combobox
										entries={comboboxEntries}
										placeholder={defaultPlaceholder}
										notFoundMessage={defaultNotFoundMessage}
										disabledIds={selectedColumnIds}
										onSelect={handleOnSelect}
									>
										<Button size="sm" variant="default" disabled={isLoading}>
											<PlusIcon />
										</Button>
									</Combobox>
								</TooltipTrigger>

								<TooltipContent sideOffset={5}>Clique para adicionar uma coluna</TooltipContent>
							</Tooltip>
						</div>
					</CardHeader>
				</Card>

				<div className="flex flex-wrap gap-2">
					{selectedColumns.map(({ id, name, columnContacts }) => (
						<Button key={id} className="flex gap-2 h-9" variant="outline" size="sm" disabled={isLoading}>
							{name}

							<Tooltip>
								<TooltipTrigger>
									<div className="flex items-center justify-center bg-primary text-primary-foreground w-5 h-5 text-[10px]/[11px] rounded-full">
										{columnContacts.length}
									</div>
								</TooltipTrigger>

								<TooltipContent sideOffset={5}>Número de contatos na coluna</TooltipContent>
							</Tooltip>

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<i className="cursor-pointer ml-2">
										<XIcon />
									</i>
								</AlertDialogTrigger>

								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Tem certeza que deseja remover a coluna <br />
											<i>“{name.trim()}”</i>?
										</AlertDialogTitle>

										<AlertDialogDescription>
											Você poderá adicioná-la novamente, se assim desejar.
										</AlertDialogDescription>
									</AlertDialogHeader>

									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction onClick={() => handleRemove(id)}>Remover</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</Button>
					))}
				</div>
			</div>

			<ConfirmChanges progress={progress}>
				{isLoading || progress === 100 ? (
					<Button
						className="relative flex items-center justify-center"
						variant="outline"
						size="sm"
						onClick={() => {
							if (progress < 100) return;
							handleReset();
						}}
					>
						<span style={{ opacity: progress === 100 ? 0 : isLoading ? 0 : 1 }}>Exportar</span>

						{progress < 100 && isLoading && <Spinner className="absolute inset-0 m-auto" />}

						{progress === 100 && !isLoading && <RotateCcwIcon className="absolute inset-0 m-auto" />}
					</Button>
				) : (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								className="relative flex items-center justify-center"
								variant="outline"
								size="sm"
								disabled={!selectedContactIds.length}
							>
								Exportar
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Deseja exportar as colunas?</AlertDialogTitle>

								<AlertDialogDescription>
									As colunas serão exportadas para um arquivo Excel (.xlsx).
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={handleExport}>Exportar</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</ConfirmChanges>
		</div>
	);
}

function fetchContacts(
	contactIds: Array<number>,
	setFetchedContacts: Dispatch<SetStateAction<Array<Contact>>>,
): Promise<Array<Contact>> {
	return new Promise((resolve) => {
		const fetchedContacts: Array<Contact> = [];

		let currentCount = 0;
		const intervalId = setInterval(() => {
			if (currentCount === contactIds.length - 1) clearInterval(intervalId);

			api.get<Contact>(`/contacts/${contactIds[currentCount]}`).then(({ data }) => {
				fetchedContacts.push(data);
				setFetchedContacts((state) => [...state, data]);

				if (fetchedContacts.length === contactIds.length) resolve(fetchedContacts);
			});

			currentCount += 1;
		}, 25);
	});
}

function downloadExcel(data: Array<Contact>): Promise<void> {
	return new Promise((resolve) => {
		(async () => {
			const workbook = new ExcelJS.Workbook();
			const sheet = workbook.addWorksheet("1");
			sheet.columns = [
				{ header: "Nome", key: "name", width: 102 },
				{ header: "Número", key: "number", width: 26 },
			];
			sheet.addRows(data);
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = "LISTA_DE_CLIENTES.xlsx";
			a.style.display = "none";
			document.body.appendChild(a);
			a.click();

			a.remove();
			URL.revokeObjectURL(url);

			resolve(undefined);
		})();
	});
}
