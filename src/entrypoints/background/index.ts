import { CHANGE_EXTENSION_VISIBILITY_EVENT_NAME } from "@/utils/constants";

export default defineBackground(() => {
	browser.action.setPopup({ popup: "" }).then(() => {
		browser.action.onClicked.addListener(async (currentTab) => {
			const sacMaisTabs = await browser.tabs.query({ url: "*://*.sacmais.com.br/*" });
			const sacMaisTab = sacMaisTabs.find((tab) => tab?.id === currentTab?.id);

			if (!sacMaisTab?.id) return;

			const visibility = await storage.getItem(STORAGE_KEY, { fallback: "invisible" });
			const newVisibility = visibility === "invisible" ? "visible" : "invisible";

			await storage.setItem(STORAGE_KEY, newVisibility);
			browser.tabs.sendMessage(sacMaisTab.id, { type: CHANGE_EXTENSION_VISIBILITY_EVENT_NAME, payload: newVisibility });
		});
	});
});
