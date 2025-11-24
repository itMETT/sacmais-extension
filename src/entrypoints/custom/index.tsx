import { Modal } from "@/components/modal";
import { Sidebar } from "@/components/sidebar";
import { ExportColumns } from "./components/export-columns";

const sidebarEntries = [
	{
		title: "Exportar colunas",
		Component: ExportColumns,
	},
	{
		title: "Transferir contatos entre colunas",
		Component: () => "Transfer Contacts",
	},
];

export function CustomUI() {
	const [selectedSidebarEntryIndex, setSelectedSidebarEntryIndex] = useState<number>(0);

	const Content = useMemo(() => sidebarEntries[selectedSidebarEntryIndex].Component, [selectedSidebarEntryIndex]);
	return (
		<Modal>
			<Sidebar
				entries={sidebarEntries}
				selectedEntryIndex={selectedSidebarEntryIndex}
				onSelect={setSelectedSidebarEntryIndex}
			/>
			<div className="p-4">
				<Content />
			</div>
		</Modal>
	);
}
