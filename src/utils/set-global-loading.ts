export function setGlobalLoading(isLoading: boolean) {
	document.body.classList.toggle("is-loading", isLoading);
}
