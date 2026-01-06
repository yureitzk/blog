export function createURL(base: string, path: string): string {
	const url = new URL(path, base);
	return url.href.replace(/\/$/, '');
}
