export default class Skills {
	constructor(selectors: Element) {
		let skillsZone = selectors.getElementsByClassName('skills'),
			overZone = false;

		[... selectors.getElementsByClassName('legend__item')].forEach(level => {
			let levelAttr = level.getAttribute('level');

			level.addEventListener('mouseover', () => {
				overZone = true;
				skillsZone[0].className = `skills ${levelAttr}`;
			});

			level.addEventListener('mouseleave', () => overZone = false);
		});

		selectors.getElementsByClassName('legend')[0].addEventListener('mouseout', () => {
			setTimeout(() => {
				if (!overZone) {
					skillsZone[0].className = 'skills';
				}
			}, 100);
		});
	}
}
