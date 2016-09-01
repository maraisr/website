interface AppElement extends Element {
	hash?: string;
}

export default class Nav {
	constructor(selectors: NodeList) {
		[...selectors].map((v: AppElement) => ((document.getElementById(`content-${v.hash.replace(/^#/, '')}`)) ? v.addEventListener('click', (e: MouseEvent) => {
			e.preventDefault();

			(function scroll(to: number, duration: number) {
				if (duration <= 0) return;
				let dif = to - document.body.scrollTop;
				let perTick = dif / duration * 10;

				setTimeout(() => {
					document.body.scrollTop += perTick;
					if (document.body.scrollTop == to) return;
					scroll(to, duration - 10);
				}, 10);
			})(document.getElementById(`content-${(<AppElement>e.target).hash.replace(/^#/, '')}`).offsetTop, 600);

			return false;
		}) : void 0));
	}
}
