export function getTheme() {
	if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
		return localStorage.getItem('theme') ?? 'light';
	}

	return 'light';
}

export function detectOveflow(element: Element): boolean {
	const isHorizontallyOverflowing = element.scrollWidth > element.clientWidth;
	const isVerticallyOverflowing = element.scrollHeight > element.clientHeight;

	if (isHorizontallyOverflowing || isVerticallyOverflowing) {
		return true;
	} else {
		return false;
	}
}

export function windowDebounce(fn: Function, delay: number) {
	let timeoutId: number | undefined;

	return (...args: any[]) => {
		if (timeoutId) {
			window.clearTimeout(timeoutId);
		}
		timeoutId = window.setTimeout(() => fn(...args), delay);
	};
}

export const hasFocus = (ele: HTMLElement | null): boolean =>
	ele === document.activeElement;

export const getDocHeight = () => Math.floor(document.body.clientHeight);
export const getTocLinkFromHeading = (h: HTMLElement): HTMLElement | null =>
	document.querySelector<HTMLAnchorElement>(`#toc-list a[href="#${h.id}"]`);
export const getTocParentLinkFromTocLink = (
	l: HTMLElement | null,
): HTMLElement | null =>
	l
		?.closest<HTMLLIElement>('#toc-list > li')
		?.querySelector<HTMLAnchorElement>(':scope > a') ?? null;
export const markTocItemActive = (a: HTMLElement) =>
	a?.classList.add('active-toc-item');
export const markTocItemInactive = (a: HTMLElement) =>
	a?.classList.remove('active-toc-item');
