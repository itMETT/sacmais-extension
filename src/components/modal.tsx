import type React from "react";

type Props = {
	children: React.ReactNode;
};

export function Modal({ children }: Props) {
	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<div className="flex rounded-xl overflow-hidden text-white bg-black w-[clamp(24rem,80vw,90vw)] h-[clamp(20rem,80vh,90vh)]">
				{children}
			</div>
		</div>
	);
}
