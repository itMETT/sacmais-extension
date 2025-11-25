import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronsUpDown, RotateCcwIcon } from "lucide-react";
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
import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { Combobox } from "@/components/ui/combobox";

type Contact = { id: number; name: string; number: string };

const defaultPlaceholder = "Escolha uma coluna";
const defaultNotFoundMessage = "Nenhuma coluna encontrada";

export function TransferContacts() {
	const [originColumnId, setOriginColumnId] = useState<number | null>(null);
	const [destinationColumnId, setDestinationColumnId] = useState<number | null>(null);
	const [transferedContacts, setTransferedContacts] = useState<Array<Contact>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const columns = useCRMStore((state) => state.columns);
	const comboboxEntries = useMemo(
		() => columns.map(({ id, name, board }) => ({ id, name, group: board.name })),
		[columns],
	);

	const originColumn = useMemo(() => columns.find((column) => column.id === originColumnId), [columns, originColumnId]);
	const destinationColumn = useMemo(
		() => columns.find((column) => column.id === destinationColumnId),
		[columns, destinationColumnId],
	);

	const originContactIds = useMemo(() => {
		if (!originColumn) return [];
		return originColumn.columnContacts.map(({ contactId }) => contactId);
	}, [originColumn]);

	const handleTransfer = useCallback(async () => {
		setIsLoading(true);

		await transferContacts(originColumnId!, destinationColumnId!, originContactIds, setTransferedContacts);
		setIsLoading(false);
	}, [originColumnId, destinationColumnId, setIsLoading, originContactIds, setTransferedContacts]);

	const progress = useMemo(
		() => (transferedContacts.length * 100) / (originContactIds.length || 1),
		[transferedContacts, originContactIds],
	);

	const handleReset = useCallback(() => {
		useCRMStore.getState().fetch();
		setTransferedContacts([]);
		setOriginColumnId(null);
		setDestinationColumnId(null);
	}, [setTransferedContacts]);

	return (
		<div className="flex flex-col flex-1">
			<div className="flex flex-col gap-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-[1.2rem]">Transferir contatos entre colunas</CardTitle>
						<CardDescription>Escolha a coluna de origem e destino dos contatos que deseja transferir</CardDescription>
					</CardHeader>
				</Card>

				<div className="flex flex-wrap gap-2">
					<Item className="w-full" variant="outline">
						<ItemContent className="text-muted-foreground">Origem</ItemContent>

						<ItemActions>
							<Combobox
								entries={comboboxEntries}
								placeholder={defaultPlaceholder}
								notFoundMessage={defaultNotFoundMessage}
								selectedId={originColumnId}
								onSelect={setOriginColumnId}
							>
								<Button className="flex gap-2 h-9" variant="outline" size="sm" disabled={isLoading}>
									{originColumn ? originColumn.name : "Nehuma coluna selecionada..."}

									{originColumn && (
										<Tooltip>
											<TooltipTrigger>
												<div className="flex items-center justify-center bg-primary text-primary-foreground w-5 h-5 text-[10px]/[11px] rounded-full">
													{originColumn.columnContacts.length}
												</div>
											</TooltipTrigger>

											<TooltipContent sideOffset={5}>Número de contatos na coluna</TooltipContent>
										</Tooltip>
									)}

									<ChevronsUpDown className="opacity-50 ml-2" />
								</Button>
							</Combobox>
						</ItemActions>
					</Item>

					<Item className="w-full" variant="outline">
						<ItemContent className="text-muted-foreground">Destino</ItemContent>

						<ItemActions>
							<Combobox
								entries={comboboxEntries}
								placeholder={defaultPlaceholder}
								notFoundMessage={defaultNotFoundMessage}
								disabledIds={originColumnId === null ? null : [originColumnId]}
								selectedId={destinationColumnId}
								onSelect={setDestinationColumnId}
							>
								<Button className="flex gap-2 h-9" variant="outline" size="sm" disabled={isLoading}>
									{destinationColumn ? destinationColumn.name : "Nehuma coluna selecionada..."}

									{destinationColumn && (
										<Tooltip>
											<TooltipTrigger>
												<div className="flex items-center justify-center bg-primary text-primary-foreground w-5 h-5 text-[10px]/[11px] rounded-full">
													{destinationColumn.columnContacts.length}
												</div>
											</TooltipTrigger>

											<TooltipContent sideOffset={5}>Número de contatos na coluna</TooltipContent>
										</Tooltip>
									)}

									<ChevronsUpDown className="opacity-50 ml-2" />
								</Button>
							</Combobox>
						</ItemActions>
					</Item>
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
						<span style={{ opacity: progress === 100 ? 0 : isLoading ? 0 : 1 }}>Tranferir</span>

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
								disabled={!originColumn || !destinationColumn || !originContactIds.length}
							>
								Transferir
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Deseja transferir os contatos da coluna <br />
									<i>“{originColumn?.name.trim()}”</i> para a coluna <br />
									<i>“{destinationColumn?.name.trim()}”</i>?
								</AlertDialogTitle>

								<AlertDialogDescription>Essa ação não poderá ser desfeita.</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={handleTransfer}>Transferir</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</ConfirmChanges>
		</div>
	);
}

function transferContacts(
	originColumnId: number,
	destinationColumnId: number,
	contactIds: Array<number>,
	setTransferedContacts: Dispatch<SetStateAction<Array<Contact>>>,
): Promise<Array<Contact>> {
	return new Promise((resolve) => {
		const transferedContacts: Array<Contact> = [];

		let currentCount = 0;
		const intervalId = setInterval(() => {
			if (currentCount === contactIds.length - 1) clearInterval(intervalId);

			api
				.put<Contact>(`/board-columns/${contactIds[currentCount]}/move`, {
					oldColumnId: originColumnId,
					newColumnId: destinationColumnId,
				})
				.then(({ data }) => {
					transferedContacts.push(data);
					setTransferedContacts((state) => [...state, data]);

					if (transferedContacts.length === contactIds.length) resolve(transferedContacts);
				});

			currentCount += 1;
		}, 50);
	});
}
