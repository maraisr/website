class introWordFlip {
	constructor(el) {
		this.words = [
			'JavaScript maustro',
			'test',
			'lol'
		];
		this.el = el;

		el.removeAttribute('bind-js');

		this.tick();
	}

	tick() {

	}
}

document.querySelectorAll('[bind-js]').forEach(v => {
	switch (((f, re) => {
		let m = void 0,
			r = f;
		while ((m = re.exec(f)) !== null) {
			if (m.index === re.lastIndex) {
				re.lastIndex++;
			}

			r = r.replace(m[0], m[1].toUpperCase());
		}

		return r;
	})(v.getAttribute('bind-js'), /_{2}([a-z])/ig)) {
		case 'introWordFlip':
			new introWordFlip(v);
			break;
	}
});
