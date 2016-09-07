import Nav from './nav';
import Skills from './skills';
import Tracking from './tracking';

export default class App {
	constructor() {
		let tracking = new Tracking();

		new Nav(document.querySelectorAll('[scroll-to]'), tracking);
		new Skills(document.getElementById('content-skills'));

		// Imprint Toggle
		/*[...document.getElementsByClassName('imprint-toggle')].forEach(btn => btn.addEventListener('click', () => {
		 document.body.classList.toggle('imprint-open');
		 })
		 );*/
	}
}
