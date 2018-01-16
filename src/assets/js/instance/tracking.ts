export default new class Tracking implements TrackingInterface {
	constructor() {
		if (!__DEV__) {
			// Mailto links
			Array.from(document.querySelectorAll('[href^="mailto"]')).forEach(
				(node: Element) => {
					node.addEventListener('click', (e: MouseEvent) =>
						this.track('Nav', 'click', 'mailto')
					);
				}
			);

			Array.from(document.querySelectorAll('.social a')).forEach(
				(node: Element) => {
					let title = node.getElementsByTagName('title')[0]
						.textContent;

					node.addEventListener('click', (e: MouseEvent) => {
						this.track('Social', 'click', title);
					});
				}
			);
		}
	}

	tracKPage(): void {
		if (!__DEV__) {
			ga('create', 'UA-47550066-2', 'auto');
			fbq('init', '1370245299676379');

			ga('send', 'pageview');
			fbq('track', 'PageView');
		}
	}

	track(label: string, event: string, data: string): void {
		if (!__DEV__) {
			ga('send', 'event', label, event, data);

			fbq('trackCustom', event, {
				label,
				data
			});
		}
	}
}();
