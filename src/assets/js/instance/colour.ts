export default class Colour {
	constructor(public rgb: Array<number>) {
	}

	shade(percent: number): Colour {
		var f = this.rgb, t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f[0], G = f[1], B = f[2];
		return new Colour([(Math.round((t - R) * p) + R), (Math.round((t - G) * p) + G), (Math.round((t - B) * p) + B)]);
	}

	toString() {
		return 'rgb(' + this.rgb.join(',') + ')';
	}
}
