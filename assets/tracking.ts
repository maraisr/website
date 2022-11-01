import { type APIKEY, crowne } from 'crowne/analytics';

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
	};
	if (document.readyState === 'complete') h();
	else window.addEventListener('load', h);
});

crowne('01GEZZKPJVY8WR782M7GFK042JVpFyBS' as APIKEY)
