import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { Progress } from "./ui/progress";
import type { ReactNode } from "react";

type Prop = {
	children: ReactNode;
	progress: number;
};

export function ConfirmChanges({ children, progress }: Prop) {
	return (
		<div className="mt-auto">
			<Item className="mt-4" variant="outline" size="sm">
				<ItemContent>
					<Progress value={progress} />
				</ItemContent>

				<ItemActions>{children}</ItemActions>
			</Item>
		</div>
	);
}
