/** @param {{request: Request, waitUntil(p: Promise<any>): void}} ctx */
export async function onRequestPost(ctx) {
	const [u, r] = await ctx.request.json();
	const request = new Request(ctx.request, {
		body: JSON.stringify({
			token: 'f17175beee2851b',
			pathname: u,
			referrer: r,
		}),
	});
	request.headers.delete('cookie');
	ctx.waitUntil(fetch('https://api.seline.so/s/e', request));
	return new Response(null, { status: 200 });
}
