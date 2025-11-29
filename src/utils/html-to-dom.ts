export function htmlToDom(html: string) {
	return new DOMParser().parseFromString(html, "text/html").body.firstChild
}
