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
					className="p-4 border-b border-transparent cursor-pointer hover:bg-white/10 hover:border-white/15 hover:transition-all"
					style={{
						background: selectedEntryIndex === index ? "oklch(from var(--color-white) l c h / 10%)" : "",
						borderColor: selectedEntryIndex === index ? "oklch(from var(--color-white) l c h / 15%)" : "",
					}}
					onClick={() => onSelect(index)}
				>
					{title}
				</div>
			))}
		</div>
	);
}
