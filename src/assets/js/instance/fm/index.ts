const template = require('./template.pug').default;

const apiKey = '54df6a0bb1a7eea281e3d8443f13e33d';

export default class FM {
	constructor(private elm: HTMLElement) {
		document.addEventListener('DOMContentLoaded', ev => {
			this.setup();
		});
	}

	private setup(): void {
		const vm = new template({
			target: this.elm
		});

		this.call('user.getrecenttracks').then((track: any) => {
			track = track['recenttracks']['track'][0];

			if (track) {
				vm.set({
					track: {
						name: track.name,
						url: track.url,
						album: track['album']['#text'],
						artist: track['artist']['#text'],
						isPlaying() {
							try {
								return track['@attr']['nowplaying'];
							} catch (e) {
								return false;
							}
						}
					}
				});
			}
		});
	}

	private call(func: String, user = 'maraisr'): Promise<any> {
		return new Promise((resolve, reject) => {
			let caller = new XMLHttpRequest();

			caller.open('GET', `https://ws.audioscrobbler.com/2.0/?method=${func}&user=${user}&limit=1&api_key=${apiKey}&format=json`, true);

			caller.onload = ev => {
				resolve(JSON.parse(caller.responseText));
			};

			caller.onerror = ev => {
				reject(ev);
			};

			caller.send();
		});
	}
}
