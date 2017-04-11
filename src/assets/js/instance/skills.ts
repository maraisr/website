export default function (selectors: Element) {
	let skillsZone = selectors.getElementsByClassName('skills'),
		overZone = false;

	Array.from(selectors.getElementsByClassName('legend__item')).forEach(level => {
		let levelAttr = level.getAttribute('level');

		((evt) => {
			level.addEventListener('mouseover', evt);
			level.addEventListener('touchstart', evt);
		})(() => {
			overZone = true;
			skillsZone[0].className = `skills ${levelAttr}`;
		});

		level.addEventListener('mouseleave', () => overZone = false);
		level.addEventListener('touchend', () => overZone = false);
	});

	((evt, ref) => {
		ref.addEventListener('mouseout', evt);
		ref.addEventListener('touchend', evt);
	})(() => {
		setTimeout(() => {
			if (!overZone) {
				skillsZone[0].className = 'skills';
			}
		}, 100);
	}, selectors.getElementsByClassName('legend')[0]);
}
