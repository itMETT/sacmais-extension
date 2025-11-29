import type { ContentScriptContext } from "wxt/utils/content-script-context";
import type { IframeContentScriptUi } from "wxt/utils/content-script-ui/iframe";
import { ANCHOR_QUERY_SELECTOR, LOCAL_STORAGE_VISIBILITY_KEY } from "@/utils/constants";
import { htmlToDom } from "@/utils/html-to-dom";

let uiRef: IframeContentScriptUi<HTMLElement> | null = null;

export default defineContentScript({
	matches: ["*://*.sacmais.com.br/*"],
	cssInjectionMode: "ui",
	runAt: "document_end",
	async main(context) {
		await injectExtensionToggleButton(document, () => {
			toggleVisibility();
			init(context);
		});

		init(context);

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

			if (event.data?.type === "TURN_INVISIBLE") {
				toggleVisibility();
				init(context);
			}
		});
	},
});

async function init(context: ContentScriptContext) {
	const visibility = localStorage.getItem(LOCAL_STORAGE_VISIBILITY_KEY) ?? "invisible";
	if (visibility === "invisible") {
		uiRef?.remove();
		uiRef = null;
		return;
	}

	await waitForElement(ANCHOR_QUERY_SELECTOR);
	await mountShadowRootUi(context, document);
	return;

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

function toggleVisibility() {
	const visibility = localStorage.getItem(LOCAL_STORAGE_VISIBILITY_KEY) ?? "invisible";
	const newVisibility = visibility === "invisible" ? "visible" : "invisible";
	localStorage.setItem(LOCAL_STORAGE_VISIBILITY_KEY, newVisibility);
}

async function injectExtensionToggleButton(document: Document, onClick: () => void) {
	const HEADER_QUERY_SELECTOR = "header.q-header.q-layout__section--marginal.fixed-top";
	await waitForElement(HEADER_QUERY_SELECTOR);

	const $header = document.querySelector(HEADER_QUERY_SELECTOR);
	if (!$header) throw new Error("$hearder not found");
	const $firstHeaderButton = $header.querySelector("button:not([aria-label])");
	if (!$firstHeaderButton) throw new Error("$firstMenuButton not found");
	const $extensionToggleButton = htmlToDom(
		`<button title="Abrir extensão" class="q-btn q-btn-item non-selectable no-outline q-btn--flat q-btn--round q-btn--actionable q-focusable q-hoverable q-mr-sm" tabindex="0" type="button">
			<span class="q-focus-helper"></span>

			<span class="q-btn__content text-center col items-center q-anchor--skip justify-center row" style="margin-bottom: 2px">
				<svg class="ext-toggle-button" width="23" height="23" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" viewBox="0 0 448 448" style="enable-background:new 0 0 512 512" xml:space="preserve">
					<g>
						<path d="M394.667 213.333h-32V128c0-23.573-19.093-42.667-42.667-42.667h-85.333v-32C234.667 23.893 210.773 0 181.333 0S128 23.893 128 53.333v32H42.667C19.094 85.333.214 104.426.214 128l-.107 81.067H32c31.787 0 57.6 25.813 57.6 57.6s-25.813 57.6-57.6 57.6H.107L0 405.333C0 428.907 19.093 448 42.667 448h81.067v-32c0-31.787 25.813-57.6 57.6-57.6s57.6 25.813 57.6 57.6v32H320c23.573 0 42.667-19.093 42.667-42.667V320h32c29.44 0 53.333-23.893 53.333-53.333s-23.893-53.334-53.333-53.334z" fill="#000000" opacity="1" data-original="#000000" class=""></path>
					</g>
				</svg>
			</span>
		</button>`,
	);
	if (!$extensionToggleButton) throw new Error("Malformed $extensionToggleButton html");
	$firstHeaderButton.before($extensionToggleButton);
	$extensionToggleButton.addEventListener("click", onClick);
}
