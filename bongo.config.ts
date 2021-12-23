import { markdown } from '@bongo/markdown';
import { define } from 'bongo';

export default define({
	$site: {
		lang: 'en',
		title: 'Marais Rossouw — Creative & Application Developer',
		url: 'https://marais.io',
	},
	plugins: [
		markdown(),
	],
});
