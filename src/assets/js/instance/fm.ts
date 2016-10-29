const apiKey = '54df6a0bb1a7eea281e3d8443f13e33d';

/* Privates */
const call = Symbol();
const setup = Symbol();

export default class FM {
	constructor(private elm: HTMLElement) {
		document.addEventListener('DOMContentLoaded', ev => {
			this[setup]();
		});
	}

	private async [setup](): void {
		this.elm.innerHTML = (track => {
			return `<a href="${track.url}" rel="nofollow" target="_blank"><h4>${track['@attr']['nowplaying'] ? 'Now Playing:' : 'Recently Played:'}</h4><div class="last-fm__name">${track.name}</div><div class="last-fm__sub">${track.album['#text']} / ${track.artist['#text']}</div></a>`;
		})((await this[call]('user.getrecenttracks')).recenttracks.track[0]);
	}

	/**
	 * Returns a Promise with a call made to the Last.fm API
	 *
	 * @param func
	 * @param user
	 * @returns {Promise<T>}
	 */
	private [call](func: String, user = 'maraisr'): Promise<any> {
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
