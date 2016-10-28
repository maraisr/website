interface RecentTracksInterface {
	recenttracks: {
		track: Array<TrackInterface>
	}
}

interface TrackInterface {
	name: string,
	image: Array<{size: string, '#text': string}>,
	album: {'#text': string}
}

const apiKey = '54df6a0bb1a7eea281e3d8443f13e33d';

/* Privates */
const call = Symbol();
const setup = Symbol();

export default class FM {
	constructor(private element: Node) {
		document.addEventListener('DOMContentLoaded', ev => {
			this[setup]();
		});
	}

	private async [setup](): void {
		const recent: RecentTracksInterface = await this[call]('user.getrecenttracks');

		const uniqAlbums: Array<string> = [];

		recent.recenttracks.track
			.filter((track: TrackInterface) => {
				return track.image.filter(img => img['#text'].length > 0).length > 0 && // Only tracks with images
					!(uniqAlbums.indexOf(track.album['#text']) > -1) && // Only unique albums
					uniqAlbums.push(track.album['#text']);
			}).map(track => {
			return {
				name: track.name,
				image: track.image[track.image.length - 2]['#text'],
				album: track.album['#text']
			}
		}).forEach(v => {
			let imgWrap = document.createElement('div');
			imgWrap.className = 'last-fm__track';
			imgWrap.innerHTML = `<img src="${v.image}" alt="Track: ${v.name}, Album: ${v.album}" />`;

			this.element.appendChild(imgWrap);
		});
	}

	[call](func: String, user = 'maraisr'): Promise<RecentTracksInterface> {
		return new Promise((resolve, reject) => {
			let caller = new XMLHttpRequest();

			caller.open('GET', `http://ws.audioscrobbler.com/2.0/?method=${func}&user=${user}&limit=200&api_key=${apiKey}&format=json`, true);

			caller.onload = ev => {
				resolve(JSON.parse(caller.responseText));
			};

			caller.onerror = ev => {
				reject(ev);
			};

			caller.send();
		})
	}
}
