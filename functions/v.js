/** @param {{request: Request, waitUntil(p: Promise<any>): void, env: Record<string, string>}} ctx */
export async function onRequestGet(ctx) {
	const pathname = new URL(ctx.request.url).searchParams.get('_');
	if (!pathname) return new Response(null, { status: 400 });

	let c = await caches.default;
	let key = new URL(pathname, 'https://x.co');
	let maybe = await c.match(key);
	if (maybe) return maybe;

	let data = await getStats(pathname);
	if (data instanceof Response) return data;

	let r = [], x = pathname.split('|');
	for (let i of x) {
		let p = data.results.find(v => v.page == i);
		if (p) r.push(`${p.pageviews} views`);
		else r.push(null);
	}

	const res = new Response(JSON.stringify(r), { status: 200, headers: {
		'content-type': 'application/json;charset=utf-8',
		'cache-control': 'public,max-age=10800',
	} });
	ctx.waitUntil(c.put(key, res.clone()));

	return res;
}

async function getStats(pathname) {
	const u = new URL('https://plausible.io/api/v1/stats/breakdown');
	u.searchParams.set('metrics', 'pageviews');
	u.searchParams.set('site_id', 'marais.io');
	u.searchParams.set('period', '12mo');
	u.searchParams.set('property', 'event:page');
	u.searchParams.set('filters', `event:page==${pathname}`);

	const d = await fetch(u, { headers: { Authorization: `Bearer ${ctx.env.PLAUSIBLE_API_KEY}` } });
	if (!d.ok) return new Response(null, { status: 400 });

	const data = await d.json();
	if (!data.results) return new Response(null, { status: 400 });
	return data.results;
}
