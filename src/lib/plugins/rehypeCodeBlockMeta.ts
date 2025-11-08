import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Element, Properties } from 'hast';
import type { Node } from 'unist';

const rehypeCodeBlockMeta: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree as Node, 'element', (node: Node) => {
			const el = node as Element;

			if (
				el.tagName === 'pre' &&
				Array.isArray(el.children) &&
				el.children.length === 1
			) {
				const first = el.children[0] as Element | Node;

				if ((first as Element).tagName === 'code') {
					const codeblock = first as Element;
					const meta = (codeblock.properties as Properties | undefined)
						?.metastring as string | undefined;

					if (meta && meta.trim().length > 0) {
						const attributes = meta
							.split(/\s+/)
							.reduce<Record<string, string | boolean>>((acc, attribute) => {
								if (!attribute) return acc;

								if (attribute.includes('=')) {
									const [rawKey, ...rest] = attribute.split('=');
									const rawValue = rest.join('=');

									// Remove surrounding quotes if present
									const value = rawValue
										.replace(/^"(.*)"$/, '$1')
										.replace(/^'(.*)'$/, '$1');

									acc[`data-${rawKey}`] = value;
								} else {
									acc[`data-${attribute}`] = true;
								}

								return acc;
							}, {});

						el.properties = Object.assign(
							(el.properties as Properties) || {},
							attributes,
						);
					}
				}
			}
		});
	};
};

export default rehypeCodeBlockMeta;
