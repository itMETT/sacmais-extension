import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronsUpDown, HashIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { type Contact, type Tag, useCRMStore } from "../../stores/crm.store";
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
import { setGlobalLoading } from "@/utils/set-global-loading";

export function TagColumns() {
	const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
	const [tagComboboxInput, setTagComboboxInput] = useState<string>("");
	const [isCreatingTag, setIsCreatingTag] = useState<boolean>(false);
	const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
	const [taggedContacts, setTaggedContacts] = useState<Array<Contact>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { tags, columns } = useCRMStore();
	const columnComboboxEntries = useMemo(
		() => columns.map(({ id, name, board }) => ({ id, name, group: board.name })),
		[columns],
	);

	const selectedColumn = useMemo(
		() => columns.find((column) => column.id === selectedColumnId),
		[columns, selectedColumnId],
	);
	const selectedTag = useMemo(() => tags.find((tag) => tag.id === selectedTagId), [columns, selectedTagId]);

	const contactIds = useMemo(() => {
		if (!selectedColumn) return [];
		return selectedColumn.columnContacts.map(({ contactId }) => contactId);
	}, [selectedColumn]);

	const handleTagging = useCallback(async () => {
		setIsLoading(true);

		await tagColumnContacts(selectedTag!, contactIds, setTaggedContacts);
		setIsLoading(false);
	}, [selectedTag, setIsLoading, contactIds, setTaggedContacts]);

	const progress = useMemo(
		() => (taggedContacts.length * 100) / (contactIds.length || 1),
		[taggedContacts, contactIds],
	);

	const handleReset = useCallback(() => {
		useCRMStore.getState().fetch();
		setTaggedContacts([]);
		setSelectedColumnId(null);
		setSelectedTagId(null);
	}, [setTaggedContacts]);

	const handleCreateTag = useCallback(async () => {
		setIsCreatingTag(true);
		setGlobalLoading(true);

		const { data: newTag } = await api.post<Tag>("/tags", { name: tagComboboxInput, color: "#ff0000" });
		await useCRMStore.getState().fetch();
		setSelectedTagId(newTag.id);

		setIsCreatingTag(false);
		setGlobalLoading(false);
	}, [tagComboboxInput]);

	const noExistentTagMatchesInputValue = useMemo(() => {
		if (!tagComboboxInput) return false;
		return tags.every((tag) => tag.name.trim().toLowerCase() !== tagComboboxInput.toLowerCase());
	}, [tags, tagComboboxInput]);

	const createTagButton = useMemo(
		() => (
			<Button
				className="justify-start ext-create-tag-button gap-2 font-normal text-[14px] px-2 py-1.5 mt-1 mx-1"
				style={{ width: "calc(100% - 8px)" }}
				variant="outline"
				size="sm"
				onClick={handleCreateTag}
			>
				{isCreatingTag ? (
					<Spinner />
				) : (
					<>
						<PlusIcon />
						Criar etiqueta
					</>
				)}
			</Button>
		),
		[isCreatingTag, handleCreateTag],
	);

	return (
		<div className="flex flex-col flex-1">
			<div className="flex flex-col gap-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-[1.2rem]">Etiquetar coluna</CardTitle>
						<CardDescription>
							Escolha a coluna alvo e a etiqueta que deseja aplicar nos contatos da coluna selecionada
						</CardDescription>
					</CardHeader>
				</Card>

				<div className="flex flex-wrap gap-2">
					<Item className="w-full" variant="outline">
						<ItemContent className="text-muted-foreground">Coluna</ItemContent>

						<ItemActions>
							<Combobox
								entries={columnComboboxEntries}
								placeholder="Pesquise uma coluna"
								notFoundMessage="Nenhuma coluna encontrada"
								selectedId={selectedColumnId}
								onSelect={setSelectedColumnId}
							>
								<Button className="flex gap-2 h-9" variant="outline" size="sm" disabled={isLoading}>
									{selectedColumn ? selectedColumn.name : "Selecione uma coluna..."}

									{selectedColumn && (
										<Tooltip>
											<TooltipTrigger>
												<div className="flex items-center justify-center bg-primary text-primary-foreground w-5 h-5 text-[10px]/[11px] rounded-full">
													{selectedColumn.columnContacts.length}
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
						<ItemContent className="text-muted-foreground">Etiqueta</ItemContent>

						<ItemActions>
							<Combobox
								entries={tags.map(({ id, name, color }) => ({ id, name, icon: <HashIcon color={color} /> }))}
								placeholder="Pesquise uma etiqueta"
								onInput={setTagComboboxInput}
								firstEntry={noExistentTagMatchesInputValue && createTagButton}
								selectedId={selectedTagId}
								onSelect={setSelectedTagId}
							>
								<Button className="flex gap-2 h-9" variant="outline" size="sm" disabled={isLoading}>
									{selectedTag ? (
										<>
											<HashIcon color={selectedTag.color} /> {selectedTag.name}
										</>
									) : (
										"Selecione uma etiqueta..."
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
								disabled={!selectedColumn || !selectedTag || !contactIds.length}
							>
								Etiquetar
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Deseja etiquetar os contatos da coluna <br />
									<i>“{selectedColumn?.name.trim()}”</i> com a etiqueta <br />
									<i>“{selectedTag?.name.trim()}”</i>?
								</AlertDialogTitle>

								<AlertDialogDescription>Essa ação não poderá ser desfeita.</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction onClick={handleTagging}>Etiquetar</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</ConfirmChanges>
		</div>
	);
}

function tagColumnContacts(
	selectedTag: Tag,
	contactIds: Array<number>,
	setTransferedContacts: Dispatch<SetStateAction<Array<Contact>>>,
): Promise<Array<Contact>> {
	return new Promise((resolve) => {
		const transferedContacts: Array<Contact> = [];

		let currentCount = 0;
		const intervalId = setInterval(async () => {
			if (currentCount === contactIds.length - 1) clearInterval(intervalId);

			api
				.get<Contact>(`/contacts/${contactIds[currentCount]}`)
				.then(({ data: { id: contactId, tags: contactTags } }) => {
					api
						.post(`/tags/sync`, {
							contactId,
							tags: contactTags.find((contactTag) => contactTag.id === selectedTag.id)
								? contactTags
								: [...contactTags, selectedTag],
						})
						.then(({ data }) => {
							transferedContacts.push(data);
							setTransferedContacts((state) => [...state, data]);

							if (transferedContacts.length === contactIds.length) resolve(transferedContacts);
						});
				});

			currentCount += 1;
		}, 25);
	});
}
