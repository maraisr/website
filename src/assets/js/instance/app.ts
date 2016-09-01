import Nav from './nav';
import Skills from './skills';

export default class App {
	constructor() {
		new Nav(document.querySelectorAll('[scroll-to]'));
		new Skills(document.getElementById('content-skills'));

		// Imprint Toggle
		[...document.getElementsByClassName('imprint-toggle')].forEach(btn => btn.addEventListener('click', () => {
				document.body.classList.toggle('imprint-open');
			})
		);
	}
}
