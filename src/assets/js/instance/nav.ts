import Tracking from './tracking';

interface AppElement extends Element {
	hash?: string;
}

export default function(selectors: NodeList): void {
	(Array.from(selectors) || [])
		.map((buttonNode: AppElement) => ({
			key: buttonNode.hash.replace(/^#/, ''),
			node: buttonNode
		}))
		.filter(({ key }) => buttonHasContentNode(key))
		.forEach(({ node, key }) => bindClickHandler(node, key));
}

function bindClickHandler(element: Element, key: string): void {
	element.addEventListener('click', (e: MouseEvent) => {
		e.preventDefault();

		const contentNode: HTMLElement = <HTMLElement>(
			document.getElementById(contentKey(key))
		);

		Tracking.track('Nav', 'click', key);

		scroll(contentNode.offsetTop, 600);
	});
}

function scroll(to: number, duration: number) {
	if (duration <= 0) return;
	const dif = to - window.pageYOffset;
	const perTick = (dif / duration) * 10;

	setTimeout(() => {
		window.scrollTo(0, window.pageYOffset + perTick);
		if (window.pageYOffset === to) return;
		scroll(to, duration - 10);
	}, 10);
}

function buttonHasContentNode(key: string): boolean {
	return !!document.getElementById(contentKey(key));
}

function contentKey(key: string): string {
	return `content-${key}`;
}
