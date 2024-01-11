export function onRequestPost(ctx) {
	const request = new Request(ctx.request);
	request.headers.delete('cookie');
	ctx.waitUntil(fetch('https://plausible.io/api/event', request));
	return new Response(null, { status: 200 });
}
