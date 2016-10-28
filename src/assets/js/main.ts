import Nav from './instance/nav';
import Skills from './instance/skills';
import Tracking from './instance/tracking';
import FM from './instance/fm';

const tracking = new Tracking();

new Nav(document.querySelectorAll('[scroll-to]'), tracking);
new Skills(document.getElementById('content-skills'));
new FM(document.getElementById('last-fm'));

// Imprint Toggle
/*[...document.getElementsByClassName('imprint-toggle')].forEach(btn => btn.addEventListener('click', () => {
 document.body.classList.toggle('imprint-open');
 })
 );*/
