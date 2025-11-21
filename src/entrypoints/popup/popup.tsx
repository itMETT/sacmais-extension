import { useEffect, useState } from "react";
import { CHANGE_EXTENSION_STATUS_EVENT_NAME, STORAGE_KEY } from "@/utils/constants";

export function Popup() {
	const [isActivated, setIsActivated] = useState(false);

	useEffect(() => {
		storage.getItem(STORAGE_KEY).then((status) => setIsActivated(status === "activated"));
	}, []);

	const handleToggle = async () => {
		const newStatus = !isActivated;
		await storage.setItem(STORAGE_KEY, newStatus ? "activated" : "not-activated");
		setIsActivated(newStatus);

		chrome.runtime.sendMessage({ type: CHANGE_EXTENSION_STATUS_EVENT_NAME });
	};

	return (
		<div className="min-w-[300px] bg-slate-50 p-8 text-center">
			<h1 className="mb-8 text-2xl font-bold text-slate-800">SacMais Customizado</h1>
			<div className="flex items-center justify-center gap-4">
				<label className="inline-flex items-center cursor-pointer">
					<input type="checkbox" checked={isActivated} onChange={handleToggle} className="sr-only peer" />
					<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
					{isActivated ? (
						<span className="ms-3 text-sm font-medium text-gray-300 dark:text-gray-900">ON</span>
					) : (
						<span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">OFF</span>
					)}
				</label>
			</div>
		</div>
	);
}
