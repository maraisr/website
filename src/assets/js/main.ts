import Tracking from './instance/tracking';

import Nav from './instance/nav';
import Skills from './instance/skills';
import FM from './instance/fm';

Tracking.tracKPage();

Nav(document.querySelectorAll('[scroll-to]'));
Skills(document.getElementById('content-skills'));

new FM(document.getElementById('last-fm'));

console.info('Nice to see you here, check out my GitHub for the full source: https://github.com/maraisr/website');
