import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { Progress } from "./ui/progress";

export function ApplyChanges() {
	return (
		<div className="mt-auto">
			<Item className="mt-4" variant="outline">
				<ItemContent>
					<Progress />
				</ItemContent>

				<ItemActions>
					<Button variant="outline" size="sm">
						Aplicar
					</Button>
				</ItemActions>
			</Item>
		</div>
	);
}
