/** @param {{request: Request, waitUntil(p: Promise<any>): void}} ctx */
export async function onRequestPost(ctx) {
	const user_ip = ctx.request.headers.get('CF-Connecting-IP');

	const [url, referrer] = await ctx.request.json();

	const request = new Request(ctx.request, {
		method: 'POST',
		body: JSON.stringify({
			action: 'track',
			payload: {
				id: crypto.randomUUID(),
				projectToken: '194e75d2-65cf-4402-a64c-67115b33d3e5',
				url,
				type: 'pageview',
				referrer,
				properties: {},
			},
		}),
	});
	request.headers.delete('cookie');
	request.headers.set('x-forwarded-for', user_ip);

	ctx.waitUntil(fetch('https://e.visitors.now/e', request));

	return new Response(null, { status: 200 });
}
