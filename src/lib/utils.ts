import type { CollectionItem } from '@src/types/CollectionItem';
import type { Post } from '@src/types/Post';
import type { CollectionKey } from 'astro:content';
import type { BreadcrumbList, ListItem } from 'schema-dts';
import { getCollection } from 'astro:content';
import { slug as slugify } from 'github-slugger';

export async function getAllPosts(): Promise<Post[]> {
	const allPosts = await customGetCollection('blog');

	return allPosts;
}

export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export async function getPostsTags(): Promise<CollectionItem[]> {
	const tags = await getTaxonomy('blog', 'tags');

	return tags;
}

export async function getPostsByTag(value: string) {
	const posts = await getCollectionFilter('blog', 'tags', value);

	return posts;
}

export function createURL(base: string, path: string): string {
	const url = new URL(path, base);
	return url.href;
}

export function createBreadcrumbList(
	site: string,
	currentPath: string,
	pageTitle: string,
): BreadcrumbList {
	const breadcrumbs: ListItem[] = [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: site,
		},
	];

	if (currentPath === '/') {
		return {
			'@type': 'BreadcrumbList',
			itemListElement: breadcrumbs,
		};
	}

	const segments = currentPath.replace(/^\/+|\/+$/g, '').split('/');
	let pathAccumulator = '';

	segments.forEach((segment, index) => {
		const currentPosition = index + 2;
		const formattedName = segment.charAt(0).toUpperCase() + segment.slice(1);

		pathAccumulator += `/${segment}`;
		breadcrumbs.push({
			'@type': 'ListItem',
			position: currentPosition,
			name: index + 1 === segments.length ? pageTitle : formattedName,
			item: createURL(site, pathAccumulator),
		});
	});

	return {
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs,
	};
}

const getCollectionFilter = async (
	type: CollectionKey,
	term: string,
	value: string,
	reverse = false,
) => {
	const items = await customGetCollection(type, true, reverse);

	// Since value might be the human label, or from a URL, we will normalize it to a slug
	const slug = slugify(value);

	// Start filtering the content collection
	return items.filter((item) => {
		const values = [];
		if (Array.isArray((item.data as Record<string, any>)[term])) {
			values.push(...(item.data as Record<string, any>)[term]);
		}

		// Does this collection entry contain the value we're looking for?
		return values.map((value) => slugify(value)).includes(slug);
	});
};

const getTaxonomy = async (
	type: CollectionKey,
	term: string,
): Promise<CollectionItem[]> => {
	const items = await customGetCollection(type);

	// Start reducing the array of blog posts into a Map where the value is the count
	const taxonomy = items.reduce((acc, item) => {
		const values = [];
		if (Array.isArray((item.data as Record<string, any>)[term])) {
			values.push(...(item.data as Record<string, any>)[term]);
		}

		for (let value of values) {
			const count = acc.get(value) || 0;
			acc.set(value, count + 1);
		}

		return acc;
	}, new Map());

	// On dev, make sure we have these tags even if there are no posts with them set
	// This is so if we go to /tags/drafts/ when there are no draft posts, we won't 404
	if (term === 'tags' && import.meta.env.MODE == 'development') {
		if (!taxonomy.has('Drafts')) {
			taxonomy.set('Drafts', 0);
		}
		if (!taxonomy.has('Scheduled')) {
			taxonomy.set('Scheduled', 0);
		}
	}

	// Convert the Map to an array of object and sort by count
	return Array.from(taxonomy, ([value, count]) => ({ value, count })).sort(
		(a, b) => b.count - a.count,
	);
};

const customGetCollection = async (
	type: CollectionKey,
	all = true,
	reverse = false,
) => {
	const items = await getCollection(type, (item) => {
		if (all && import.meta.env.MODE == 'development') {
			return true; // Show all in dev mode
		}
		if (item.data.draft) {
			return false; // Draft post
		}
		if (item.data.date && item.data.date > new Date()) {
			return false; // Future post
		}
		return true;
	});
	if (type === 'blog') {
		items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
		if (reverse) {
			items.reverse();
		}
	}
	return items;
};
