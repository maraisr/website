/** @param {{request: Request, waitUntil(p: Promise<any>): void}} ctx */
export async function onRequestPost(ctx) {
	const [u, r, w] = await ctx.request.json();
	const request = new Request(ctx.request, {
		body: JSON.stringify({
			n: 'pageview',
			d: 'marais.io',
			u,
			r,
			w,
		}),
	});
	request.headers.delete('cookie');
	ctx.waitUntil(fetch('https://plausible.io/api/event', request));
	return new Response(null, { status: 200 });
}
