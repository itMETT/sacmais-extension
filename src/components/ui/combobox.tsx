"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ReactNode } from "react";

type Entry = {
	id: number | string;
	name: string;
	icon?: ReactNode;
	group?: string;
	[key: string]: any;
};

type Props<T extends Entry> = {
	children: ReactNode;
	entries: Array<T>;
	placeholder: string;
	notFoundMessage?: ReactNode;
	selectedId?: Entry["id"] | null;
	disabledIds?: Entry["id"][] | null;
	firstEntry?: ReactNode;
	onSelect(entry: T["id"]): void;
	onInput?(value: string): void;
};

export function Combobox<T extends Entry>({
	children,
	entries,
	placeholder,
	notFoundMessage,
	selectedId,
	disabledIds,
	firstEntry,
	onSelect,
	onInput,
}: Props<T>) {
	const [open, setOpen] = useState(false);

	const isUngroupedEntries = useMemo(() => !entries?.[0]?.group, [entries]);
	const groupedEntries = useMemo(() => {
		if (isUngroupedEntries) return [];

		const initialState = {} as Record<string, Entry[]>;
		return entries.reduce((acc, cur) => {
			if (!acc[cur.group!]) acc[cur.group!] = [cur];
			else acc[cur.group!] = [...acc[cur.group!], cur];

			return acc;
		}, initialState);
	}, [isUngroupedEntries]);

	const optimizedDisabledIds: Record<Entry["id"], true> = useMemo(() => {
		if (!disabledIds) return {};
		return Object.fromEntries(disabledIds.map((id) => [id, true]));
	}, [disabledIds]);

	useEffect(() => setOpen(false), [selectedId]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>

			<PopoverContent className="w-[200px] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
				<Command>
					<CommandInput
						placeholder={placeholder}
						className="h-9"
						onInput={(event) => onInput?.((event.target as HTMLInputElement).value)}
					/>
					<CommandList>
						{notFoundMessage && <CommandEmpty>{notFoundMessage}</CommandEmpty>}
						{firstEntry}

						{isUngroupedEntries ? (
							<CommandGroup>
								{entries.map(({ id, name, icon }) => (
									<CommandItem
										key={id}
										value={name}
										onSelect={() => {
											setOpen(false);
											onSelect(id);
										}}
										disabled={optimizedDisabledIds[id]}
									>
										{icon}
										{name}
										<Check className={cn("ml-auto", selectedId === id ? "opacity-100" : "opacity-0")} />
									</CommandItem>
								))}
							</CommandGroup>
						) : (
							Object.entries(groupedEntries).map(([group, entries], index, originalArray) => {
								const isLastIndex = originalArray[index + 1] === undefined;
								return (
									<>
										<CommandGroup key={group} heading={group}>
											{entries.map(({ id, name, icon }) => (
												<CommandItem
													key={id}
													value={name}
													onSelect={() => {
														setOpen(false);
														onSelect(id);
													}}
													disabled={optimizedDisabledIds[id]}
												>
													{icon}
													{name}
													<Check className={cn("ml-auto", selectedId === id ? "opacity-100" : "opacity-0")} />
												</CommandItem>
											))}
										</CommandGroup>

										{!isLastIndex && <CommandSeparator />}
									</>
								);
							})
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
