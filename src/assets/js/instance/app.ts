export default class App {
	constructor() {
		[...document.querySelectorAll('[scroll-to]')].map(v => ((document.getElementById(`content-${v.hash.replace(/^#/, '')}`)) ? v.addEventListener('click', (e: MouseEvent) => {
			e.preventDefault() && e.cancelBubble;

			(function scroll(to: number, duration: number) {
				if (duration <= 0) return;
				let dif = to - document.body.scrollTop;
				let perTick = dif / duration * 10;

				setTimeout(() => {
					document.body.scrollTop = document.body.scrollTop + perTick;
					if (document.body.scrollTop == to) return;
					scroll(to, duration - 10);
				}, 10);
			})(document.getElementById(`content-${e.target.hash.replace(/^#/, '')}`).offsetTop, 600);

			return false;
		}) : void 0));
	}
}
