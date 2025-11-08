import { headingRank } from 'hast-util-heading-rank';
import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element, Parent } from 'hast';
import type { Node } from 'unist';

function rehypeTocExclude() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Node, index, parent: Parent) => {
			const parentEl = parent as Element;
			if (headingRank(node as Element) && headingRank(node as Element)! > 0) {
				if (
					parentEl &&
					parentEl.type === 'element' &&
					parentEl.tagName === 'blockquote'
				) {

					if (typeof index === 'number' && parentEl.children) {
						parentEl.children.splice(index, 1);
						return [SKIP, index];
					}
				}
			}
		});
	};
}

export default rehypeTocExclude;
