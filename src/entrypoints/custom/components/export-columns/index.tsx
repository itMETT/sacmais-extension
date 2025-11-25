import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusIcon, XIcon } from "lucide-react";
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

const defaultPlaceholder = "Escolha uma coluna";
const defaultNotFoundMessage = "Nenhuma coluna encontrada";

export function ExportColumns() {
	const [selectedColumnIds, setSelectedColumnIds] = useState<Array<number>>([]);
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
							<Button
								key={id}
								className="flex gap-2 h-9"
								variant="outline"
								size="sm"
								onClick={() => console.log("teste")}
								onFocus={(event) => {
									event.preventDefault();
									event.stopPropagation();
								}}
							>
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
										<i className="cursor-pointer ml-2" onClick={(event) => event.stopPropagation()}>
											<XIcon />
										</i>
									</AlertDialogTrigger>

									<AlertDialogContent
										onOpenAutoFocus={(e) => e.preventDefault()}
										onCloseAutoFocus={(e) => e.preventDefault()}
									>
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
											<AlertDialogAction
												onClick={(event) => {
													event.stopPropagation();
													event.preventDefault();
													handleRemove(id);
												}}
											>
												Remover
											</AlertDialogAction>
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
									<Button size="sm" variant="default">
										<PlusIcon />
									</Button>
								</Combobox>
							</TooltipTrigger>

							<TooltipContent sideOffset={5}>Clique para adicionar uma coluna</TooltipContent>
						</Tooltip>
					</CardContent>
				</Card>
			</div>

			<ApplyChanges />
		</div>
	);
}
