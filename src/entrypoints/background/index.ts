import { CHANGE_EXTENSION_STATUS_EVENT_NAME } from '@/utils/constants';

export default defineBackground(() => {

  chrome.runtime.onMessage.addListener(async (message, _sender) => {
    if (message.type === CHANGE_EXTENSION_STATUS_EVENT_NAME) {
      const sacMaisTabs = await browser.tabs.query({ url: "*://*.sacmais.com.br/*" });

      for (const sacMaisTab of sacMaisTabs) {
        if (sacMaisTab.id) browser.tabs.sendMessage(sacMaisTab.id, { type: CHANGE_EXTENSION_STATUS_EVENT_NAME });
      }
    };
  });
});
