import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

export function Modal({ children }: Props) {
	const handleOnClose = useCallback(() => {
		window.parent.postMessage({ type: "TURN_INVISIBLE" }, "*");
	}, []);
	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<div className="absolute z-1 size-full" onClick={handleOnClose} />

			<div className="relative z-2 flex rounded-xl overflow-hidden text-white bg-black w-[clamp(24rem,65vw,90vw)] h-[clamp(20rem,80vh,90vh)]">
				{children}
			</div>
		</div>
	);
}
