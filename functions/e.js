/** @param {{request: Request, waitUntil(p: Promise<any>): void}} ctx */
export async function onRequestPost(ctx) {
	const [u, r, w] = await ctx.request.json();
	const request = new Request(ctx.request, { body: null });
	request.headers.delete('cookie');

	const plausible = new Request(request.clone(), {
		body: JSON.stringify({
			n: 'pageview',
			d: 'marais.io',
			u,
			r,
			w,
		}),
	});
	ctx.waitUntil(fetch('https://plausible.io/api/event', plausible));

	const seline = new Request(request.clone(), {
		body: JSON.stringify({
			token: 'f17175beee2851b',
			pathname: new URL(u).pathname,
			referrer: r,
		}),
	});
	seline.headers.set('Seline-IP', ctx.request.headers.get('CF-Connecting-IP'));
	seline.headers.set('Seline-Country', ctx.request.headers.get('CF-IPCountry'));
	ctx.waitUntil(fetch('https://api.seline.so/s/e', seline));

	return new Response(null, { status: 200 });
}
