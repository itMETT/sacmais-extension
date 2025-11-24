type Props = {
	entries: Array<{ title: string }>;
	selectedEntryIndex: number;
	onSelect: (entryIndex: number) => void;
};

export function Sidebar({ entries, selectedEntryIndex, onSelect }: Props) {
	return (
		<div className="border-r-2 border-gray-900/50 max-w-40">
			{entries.map(({ title }, index) => (
				<div
					key={title}
					className="p-4 border-b-2 border-gray-900/50 cursor-pointer hover:bg-gray-900 hover:border-gray-950/20 hover:transition-all"
					style={{
						background: selectedEntryIndex === index ? "var(--color-gray-900)" : "",
						borderColor: selectedEntryIndex === index ? "oklch(from var(--color-gray-950) l c h / 20%)" : "",
					}}
					onClick={() => onSelect(index)}
				>
					{title}
				</div>
			))}
		</div>
	);
}
