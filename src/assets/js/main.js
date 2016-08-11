class introWordFlip {
	constructor(el) {
		this.words = [
			'JavaScript maustro',
			'coffee consumer',
			'front end developer',
			'build script extraordinaire',
			'css genius'
		];

		this.el = el;
		this.index = 0;

		setInterval(this.tick.bind(this), 1000);
	}

	tick() {
		this.index = (this.index + 1 > this.words.length - 1) ? 0 : this.index + 1;
		this.el.innerText = this.words[this.index];
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

		v.removeAttribute('bind-js');

		return r;
	})(v.getAttribute('bind-js'), /_{2}([a-z])/ig)) {
		case 'introWordFlip':
			new introWordFlip(v);
			break;
	}
});
