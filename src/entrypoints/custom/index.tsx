import { Modal } from "@/components/modal";
import { Sidebar } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useParentStore } from "./stores/parent.store";
import { setupAxios } from "@/lib/axios";
import { TransferContacts } from "./components/transfer-contacts";
import { useCRMStore } from "./stores/crm.store";
import { ExportColumns } from "./components/export-columns";
import { TagColumns } from "./components/tag-columns";

const sidebarEntries = [
	{
		title: "Etiquetar coluna",
		Component: TagColumns,
	},
	{
		title: "Transferir contatos entre colunas",
		Component: TransferContacts,
	},
	{
		title: "Exportar colunas",
		Component: ExportColumns,
	},
];

export function CustomUI() {
	const [selectedSidebarEntryIndex, setSelectedSidebarEntryIndex] = useState<number>(0);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const Content = useMemo(() => sidebarEntries[selectedSidebarEntryIndex].Component, [selectedSidebarEntryIndex]);

	useEffect(() => {
		useParentStore.getState().init();
		const unsubscribe = useParentStore.subscribe(async (state) => {
			if (!state.token) return;

			unsubscribe();
			setupAxios(state.token, state.baseURL);
			await useCRMStore.getState().fetch();
			setIsLoaded(true);
		});
	}, []);

	return (
		<Modal>
			{isLoaded ? (
				<>
					<Sidebar
						entries={sidebarEntries}
						selectedEntryIndex={selectedSidebarEntryIndex}
						onSelect={setSelectedSidebarEntryIndex}
					/>
					<div className="flex flex-col flex-1 p-4">
						<Content />
					</div>
				</>
			) : (
				<Spinner className="w-32 h-32 m-auto" />
			)}
		</Modal>
	);
}
