import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { IframeContentScriptUi } from "wxt/utils/content-script-ui/iframe";
import { CHANGE_EXTENSION_STATUS_EVENT_NAME, STORAGE_KEY } from "@/utils/constants";

const whereToShowCustomUI = [/\/#\/boards$/];

let uiRef: IframeContentScriptUi<void> | null = null;
let lastHref: string;
const ANCHOR_QUERY_SELECTOR = ".q-page-container";

export default defineContentScript({
	matches: ["*://*.sacmais.com.br/*"],
	cssInjectionMode: "ui",
	runAt: "document_end",
	async main(context) {
		lastHref = location.href;
		init(location.href, context);

		chrome.runtime.onMessage.addListener((message, _sender) => {
			if (message.type === CHANGE_EXTENSION_STATUS_EVENT_NAME) init(location.href, context);
		});

		setInterval(() => {
			if (location.href === lastHref) return;

			lastHref = location.href;
			init(location.href, context);
		}, 150);
	},
});

async function init(url: string, context: ContentScriptContext) {
	const activatedStatus = await storage.getItem(STORAGE_KEY, { fallback: "not-activated" });

	if (isAllowedURL(url) && activatedStatus === "not-activated") {
		document.body.removeAttribute("extension-activated");
		uiRef?.remove();
		uiRef = null;
		return;
	}

	if (isAllowedURL(url)) {
		await waitForElement(ANCHOR_QUERY_SELECTOR);
		await mountShadowRootUi(context, document);
		document.body.setAttribute("extension-activated", "");
		return;
	}

	document.body.removeAttribute("extension-activated");
	uiRef?.remove();
	uiRef = null;
}

async function mountShadowRootUi(context: ContentScriptContext, document: Document) {
	if (uiRef) {
		uiRef.remove();
		uiRef = null;
	}

	const $wrapper = document.createElement("div");
	const $container = document.querySelector(ANCHOR_QUERY_SELECTOR)!;
	$container.append($wrapper);

	uiRef = createIframeUi(context, {
		page: "/custom.html",
		position: "inline",
		anchor: $wrapper,
		onMount(_wrapper, $iframe) {
			$iframe.width = "100%";
			$iframe.height = "100%";
			$iframe.style.border = "none";
		},
	});

	uiRef.mount();
}

function waitForElement(querySelector: string) {
	return new Promise((resolve) => {
		const $desiredElement = document.querySelector(querySelector);
		if ($desiredElement) return resolve(true);

		const observer = new MutationObserver(() => {
			const $element = document.querySelector(querySelector);
			if (!$element) return;

			observer.disconnect();
			resolve(true);
		});

		observer.observe(document.body, { childList: true, subtree: true });
	});
}

function isAllowedURL(url: string) {
	return whereToShowCustomUI.some((allowedURL) => allowedURL.test(url));
}
