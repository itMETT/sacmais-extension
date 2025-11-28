import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { IframeContentScriptUi } from "wxt/utils/content-script-ui/iframe";
import { ANCHOR_QUERY_SELECTOR, CHANGE_EXTENSION_VISIBILITY_EVENT_NAME, STORAGE_KEY } from "@/utils/constants";

let uiRef: IframeContentScriptUi<HTMLElement> | null = null;
let lastHref: string;

export default defineContentScript({
	matches: ["*://*.sacmais.com.br/*"],
	cssInjectionMode: "ui",
	runAt: "document_end",
	async main(context) {
		lastHref = location.href;
		init(context);

		chrome.runtime.onMessage.addListener((message, _sender) => {
			if (message.type === CHANGE_EXTENSION_VISIBILITY_EVENT_NAME) {
				init(context);
			}
			if (message.type === "GET_AUTH_TOKEN") {
				postMessage({ type: "SEND_AUTH_TOKEN", payload: localStorage.getItem("time") });
			}
		});

		window.addEventListener("message", (event) => {
			if (event.data?.type === "GET_PARENT_DATA") {
				const payload = {
					token: localStorage.getItem("token"),
					baseURL: localStorage.getItem("instanceAddress"),
				};

				uiRef?.iframe?.contentWindow?.postMessage({ type: "SEND_PARENT_DATA", payload }, "*");
			}

			if (event.data?.type === "RELOAD") {
				location.reload();
			}
		});

		setInterval(() => {
			if (location.href === lastHref) return;

			lastHref = location.href;
			init(context);
		}, 150);
	},
});

async function init(context: ContentScriptContext) {
	const activatedStatus = await storage.getItem(STORAGE_KEY, { fallback: "invisible" });

	if (activatedStatus === "invisible") {
		uiRef?.remove();
		uiRef = null;
		return;
	}

	await waitForElement(ANCHOR_QUERY_SELECTOR);
	await mountShadowRootUi(context, document);
	return;
}

async function mountShadowRootUi(context: ContentScriptContext, _document?: Document) {
	if (uiRef) {
		uiRef.remove();
		uiRef = null;
	}

	uiRef = createIframeUi(context, {
		page: "/custom.html",
		position: "inline",
		anchor: ANCHOR_QUERY_SELECTOR,
		onMount($wrapper, $iframe) {
			$wrapper.style.position = "absolute";
			$wrapper.style.inset = "0";
			$wrapper.style.zIndex = "10000";
			$wrapper.style.background = "oklch(0 0 0 / 50%)";
			$wrapper.style.backdropFilter = "blur(4px)";
			$wrapper.style.overflow = "hidden";
			document.body.style.overflow = "hidden";

			$iframe.width = "100%";
			$iframe.height = "100%";
			$iframe.style.border = "none";

			return $wrapper;
		},
		onRemove($mounted) {
			document.body.style.overflow = "";
			$mounted?.remove();
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
