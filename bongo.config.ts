import { define } from 'bongo';
import * as markdown from '@bongo/markdown';

export default define({
	$site: {
		lang: 'en',
		title: 'Marais Rossouw — Creative & Application Developer',
		url: 'https://marais.io',
	},
	plugins: [
		markdown
	]
});
