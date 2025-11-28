import { CHANGE_EXTENSION_VISIBILITY_EVENT_NAME, STORAGE_KEY } from "@/utils/constants";

export default defineBackground(() => {
	browser.action.setPopup({ popup: "" }).then(() => {
		browser.action.onClicked.addListener(async (currentTab) => {
			if (!(await isSacMaisTab(currentTab))) return;

			const visibility = await storage.getItem(STORAGE_KEY, { fallback: "invisible" });
			const newVisibility = visibility === "invisible" ? "visible" : "invisible";

			await storage.setItem(STORAGE_KEY, newVisibility);
			browser.tabs.sendMessage(currentTab.id!, {
				type: CHANGE_EXTENSION_VISIBILITY_EVENT_NAME,
				payload: newVisibility,
			});
		});
	});
});

async function isSacMaisTab(currentTab: Browser.tabs.Tab | undefined): Promise<boolean> {
	if (!currentTab?.id) return false;

	const sacMaisTabs = await browser.tabs.query({ url: "*://*.sacmais.com.br/*" });
	const sacMaisTab = sacMaisTabs.find((tab) => tab?.id === currentTab?.id);

	return Boolean(sacMaisTab);
}
