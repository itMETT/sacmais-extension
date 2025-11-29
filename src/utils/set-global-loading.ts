export function setGlobalLoading(isLoading: boolean) {
	document.body.classList.toggle("ext-is-loading", isLoading);
}
