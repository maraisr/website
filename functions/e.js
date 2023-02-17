export function onRequestPost({ request: req }) {
	const request = new Request(req);
	request.headers.delete('cookie');
	return fetch('https://plausible.io/api/event', request);
}
