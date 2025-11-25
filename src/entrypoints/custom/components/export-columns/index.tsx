import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useCRMStore } from "../../stores/crm.store";
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

const defaultPlaceholder = "Escolha uma coluna";
const defaultNotFoundMessage = "Nenhuma coluna encontrada";

type Contact = { id: number; name: string; number: string };

export function ExportColumns() {
	const [selectedColumnIds, setSelectedColumnIds] = useState<Array<number>>([]);
	const [selectedContacts, setSelectedContacts] = useState<Array<Contact>>([]);
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

		const contacts = await exportSelectedColumnsContacts(selectedContactIds, setSelectedContacts);
		await downloadCsv(contacts);
		setIsLoading(false);
	}, [setIsLoading, selectedContactIds, setSelectedContacts]);

	const progress = useMemo(
		() => (selectedContacts.length * 100) / selectedContactIds.length,
		[selectedContacts, selectedContactIds],
	);

	const handleReset = useCallback(() => {
		setSelectedContacts([]);
		setSelectedColumnIds([]);
	}, [setSelectedContacts, setIsLoading]);

	return (
		<div className="flex flex-col flex-1">
			<div className="flex flex-col gap-2">
				<Card>
					<CardHeader className="border-b border-white/10">
						<CardTitle>Exportar colunas</CardTitle>
						<CardDescription>Selecione as colunas que deseja exportar</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-wrap gap-2 p-6">
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
					</CardContent>
				</Card>
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
							<Button className="relative flex items-center justify-center" variant="outline" size="sm">
								Exportar
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Deseja exportar as colunas?</AlertDialogTitle>

								<AlertDialogDescription>As colunas serão exportadas para um arquivo CSV.</AlertDialogDescription>
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

function exportSelectedColumnsContacts(
	contactIds: Array<number>,
	setContacts: Dispatch<SetStateAction<Array<Contact>>>,
): Promise<Array<Contact>> {
	return new Promise((resolve) => {
		const contacts: Array<Contact> = [];

		let currentCount = 0;
		const intervalId = setInterval(() => {
			if (currentCount === contactIds.length - 1) clearInterval(intervalId);

			api.get<Contact>(`/contacts/${contactIds[currentCount]}`).then(({ data }) => {
				contacts.push(data);
				setContacts((state) => [...state, data]);

				if (contacts.length === contactIds.length) resolve(contacts);
			});

			currentCount += 1;
		}, 50);
	});
}

function downloadCsv(data: Array<Contact>): Promise<void> {
	return new Promise((resolve) => {
		const header = "Nome;Número";
		const rows = data.map(({ name, number }) => `${name};${number}`);
		const csv = [header, ...rows].join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "LISTA_DE_CLIENTES.csv";
		a.style.display = "none";
		document.body.appendChild(a);
		a.click();

		a.remove();
		URL.revokeObjectURL(url);

		resolve(undefined);
	});
}
