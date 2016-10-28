import Nav from './instance/nav';
import Skills from './instance/skills';
import Tracking from './instance/tracking';

const tracking = new Tracking();

new Nav(document.querySelectorAll('[scroll-to]'), tracking);
new Skills(document.getElementById('content-skills'));

// Imprint Toggle
/*[...document.getElementsByClassName('imprint-toggle')].forEach(btn => btn.addEventListener('click', () => {
 document.body.classList.toggle('imprint-open');
 })
 );*/
