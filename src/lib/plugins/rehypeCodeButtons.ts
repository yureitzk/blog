import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import type { Root, Element, Parent } from 'hast';
import type { Node } from 'unist';

export default function rehypeCodeButtons() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Node, index, parent: Parent) => {
			const el = node as Element;
			const childEl = el.children[0] as Element;
			const parentEl = parent as Element;
			if (el.tagName === 'pre' && childEl.tagName === 'code') {
				const wrapper = h('div', { class: 'code-wrapper' }, [
					el,
					h('button', {
						class: 'wrap-text',
						type: 'button',
						title: 'Toggle word wrap',
						'aria-label': 'Toggle word wrap',
					}),
					h('button', {
						class: 'copy-text',
						type: 'button',
						title: 'Copy',
						'aria-label': 'Copy to clipboard',
					}),
				]);
				if (index !== undefined) {
					parentEl.children[index] = wrapper;
				}
			}
		});
	};
}
