import type { MarkdownHeading } from 'astro';

export type HeadingWithSubheadings = MarkdownHeading & {
	subheadings: MarkdownHeading[];
};
