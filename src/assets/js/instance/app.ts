import Nav from './nav';
import Skills from './skills';

export default class App {
	constructor() {
		new Nav(document.querySelectorAll('[scroll-to]'));
		new Skills(document.getElementById('content-skills'));
	}
}
