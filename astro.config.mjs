// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import rehypePrettyCode from 'rehype-pretty-code';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm';
import rehypeCodeBlockMeta from './src/lib/plugins/rehypeCodeBlockMeta.ts';
import rehypeCodeButtons from './src/lib/plugins/rehypeCodeButtons.ts';
import rehypeTocExclude from './src/lib/plugins/rehypeTocExclude.ts';
import { createURL } from './src/lib/url.ts';
import { PAGE_URL } from './src/config.ts';

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

import pagefind from 'astro-pagefind';

import AstroPWA from '@vite-pwa/astro';
import { manifestObj } from './manifest';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: PAGE_URL,
	redirects: {
		'/tags/': '/blog/',
	},
	integrations: [
		mdx({
			syntaxHighlight: false,
			remarkPlugins: [remarkGfm],
			rehypePlugins: [
				rehypeAccessibleEmojis,
				rehypeExternalLinks,
				/**
				 * Adds ids to headings
				 */
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'append',
						content: {
							type: 'text',
							value: '#',
						},
						headingProperties: {
							className: ['anchor'],
						},
						properties: {
							className: ['anchor-link'],
						},
					},
				],
				rehypeTocExclude,
				rehypeCodeBlockMeta,
				[
					/**
					 * Enhances code blocks with syntax highlighting, line numbers,
					 * titles, and allows highlighting specific lines and words
					 */

					rehypePrettyCode,
					{
						theme: {
							dark: 'github-dark',
							light: 'github-light-default',
						},
					},
				],
				rehypeCodeButtons,
			],
		}),
		icon(),
		sitemap({
			serialize(item) {
				const url = new URL(item.url);
				item.url = createURL(url.origin, url.pathname);
				return item;
			},
		}),
		pagefind(),
		AstroPWA({
			base: '/',
			scope: '/',
			includeAssets: ['favicon.png'],
			registerType: 'autoUpdate',
			manifest: manifestObj,
			workbox: {
				navigateFallback: '/404',
				globPatterns: ['**/*.{css,js,html,svg,png,webp,ico,woff2,txt,xml}'],
				skipWaiting: true,
			},
			experimental: {
				directoryAndTrailingSlashHandler: true,
			},
			devOptions: {
				enabled: false,
			},
		}),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
