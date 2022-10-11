import { type APIKEY, beacon } from 'crowne/events';

// @ts-expect-error
(window.requestIdleCallback || ((c) => c()))(() => {
	let h = () => {
		navigator.sendBeacon(
			'https://plausible.io/api/event',
			JSON.stringify({
				n: 'pageview',
				u: location.href,
				d: 'marais.io',
				r: document.referrer || null,
				w: window.innerWidth,
			}),
		);

		beacon('01GEZZKPJVY8WR782M7GFK042JVpFyBS' as APIKEY, {
			type: 'pageview',
			target: location.href,
			referrer: document.referrer || null,
			width: window.innerWidth,
			timestamp: +new Date(),
		});
	};
	if (document.readyState === 'complete') h();
	else window.addEventListener('load', h);
});
