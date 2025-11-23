import { CHANGE_EXTENSION_VISIBILITY_EVENT_NAME } from "@/utils/constants";

export default defineBackground(async () => {
	browser.action.setPopup({ popup: "" });

	browser.action.onClicked.addListener(async (currentTab) => {
		const sacMaisTabs = await browser.tabs.query({ url: "*://*.sacmais.com.br/*" });
		const sacMaisTab = sacMaisTabs.find((tab) => tab?.id === currentTab?.id);

		if (!sacMaisTab?.id) return;
		browser.tabs.sendMessage(sacMaisTab.id, { type: CHANGE_EXTENSION_VISIBILITY_EVENT_NAME });
	});
});
