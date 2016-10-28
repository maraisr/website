export default class Tracking implements TrackingInterface {
	constructor() {
		if (!__DEV__) {
			ga('create', 'UA-47550066-2', 'auto');
			ga('send', 'pageview');

			// Mailto links
			[...document.querySelectorAll('[href^="mailto"]')].forEach((node: Element) => {
				node.addEventListener('click', (e: MouseEvent) => this.track('Nav', 'click', 'mailto'));
			});

			[...document.querySelectorAll('.social a')].forEach((node: Element) => {
				let title = node.getElementsByTagName('title')[0].textContent;

				node.addEventListener('click', (e: MouseEvent) => {
					this.track('Social', 'click', title);
				});
			});
		}
	}

	track(label: string, event: string, data: string): void {
		if (!__DEV__) {
			ga('send', 'event', label, event, data);
		}
	}
}
