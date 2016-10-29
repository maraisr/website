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
		const recentTracks = (await this[call]('user.getrecenttracks')).recenttracks.track
			.map(track => {
				return {
					name: track.name,
					image: track.image[track.image.length - 2]['#text'] || null,
					album: track.album['#text'],
					artist: track.artist['#text']
				};
			});

		this.renderNowPlaying(recentTracks[0]);
	}

	private renderNowPlaying(track: any): void {
		this.elm.innerHTML = `<h3>What I'm listening to right now...</h3><figure><figcaption><div class="last-fm__now-playing__name">${track.name}</div><div class="last-fm__sub">${track.album} / ${track.artist}</div></figcaption><img src="${track.image}" /></figure>`;
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

			caller.open('GET', `http://ws.audioscrobbler.com/2.0/?method=${func}&user=${user}&limit=1&api_key=${apiKey}&format=json`, true);

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
