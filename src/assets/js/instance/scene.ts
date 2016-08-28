import Delaunay from '../vendor/delaunay';
import Colour from './colour';

//TODO: Get scene.svg's poly bounds statically from an extrernal node loader

class Triangle {
	public elm: SVGPolygonElement;
	public lum: number = 0;
	public colour: Colour;

	constructor(private points: Array<Array<number>>, type: String) {
		this.elm = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		this.elm.setAttribute('stroke-linejoin', 'round');
		this.elm.setAttribute('stroke-miterlimit', '1');
		this.elm.setAttribute('stroke-width', '1');

		function intToRGB(rgb) {
			rgb = parseInt(rgb, 16);
			return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, (rgb >> 0) & 0xff];
		}

		this.lum = ((rgb) => {
			let [r,g,b] = intToRGB(rgb);
			return (0.2126 * r + 0.7152 * g + 0.0722 * b) * 10;
		})((type || '000').replace(/^#/, ''));

		let rand = Math.random() * 0.1;

		if (this.lum < 20) {
			this.colour = (new Colour(intToRGB('333333'))).shade(rand);
		} else if (this.lum < 40) {
			this.colour = (new Colour(intToRGB('CC3333'))).shade(rand);
		} else {
			this.colour = (new Colour(intToRGB('003333'))).shade(rand);
		}
	}

	render(): SVGPolygonElement {
		this.elm.setAttribute('style', `fill: ${this.colour}; stroke: ${this.colour};`);
		this.elm.setAttribute('points', this.points.join(' '));
		return this.elm;
	}
}
class Entity {
	public triangles: Array<Triangle>;

	constructor(config) {
		this.triangles = config.triangles.map(pts => new Triangle(pts.map(pt => [config.verts[pt][0], config.verts[pt][1]]), config.type));
	}

	render() {
		return this.triangles.map(v => v.render());
	}
}

export default class Scene {
	constructor() {
		var req: XMLHttpRequest = new XMLHttpRequest();
		req.open('GET', '/img/scene.svg');
		req.send();

		function chunk(arr: Array<any>, n: number): Array<any> {
			return Array.apply(null, Array(Math.ceil(arr.length / n))).map((x: number, i: number) => i).map((x: number, i: number) => arr.slice(i * n, i * n + n));
		}

		function isPointInPoly(points, point): boolean {
			var j: number = points.length - 1;
			var output: boolean = false;

			for (var i = 0; i < points.length; i++) {
				if (points[i][0] < point[0] && points[j][0] >= point[0] || points[j][0] < point[0] && points[i][0] >= point[0]) {
					if (points[i][1] + (point[0] - points[i][0]) / (points[j][0] - points[i][0]) * (points[j][1] - points[i][1]) < point[1]) {
						output = !output;
					}
				}

				j = i;
			}

			return output;
		}

		req.onload = (e: Event) => {
			if (req.status == 200) {
				var zones = Array.prototype.slice.call(req.responseXML.querySelectorAll('path')).map((v: SVGPathElement) => {
					var segMatched = [],
						segIndex = [],
						curr = void 0;

					for (var i = 0; i < v.getTotalLength(); i++) {
						curr = v.getPathSegAtLength(i);

						if (segMatched.indexOf(curr) < 0) {
							segMatched.push(curr);
							segIndex.push(i);
						}
					}

					var bounds = segIndex.map(vv => {
							var pt = v.getPointAtLength(vv);
							return [pt.x, pt.y];
						}),
						extra = [];

					var found = 0,
						maxAttemts = 200;

					do {
						var newPoint = [Math.random() * 1024, Math.random() * 1024];
						if (isPointInPoly(bounds, newPoint)) {
							++found;

							extra.push(newPoint);
						}

					} while (found != 50 && found != maxAttemts);

					var verts = bounds.concat(extra);

					return {
						verts: verts,
						triangles: chunk(new Delaunay(verts).triangles, 3),
						type: v.getAttribute('fill')
					}
				});

				var svg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('viewBox', req.responseXML.querySelector('svg').getAttribute('viewBox'));

				zones.map(v => new Entity(v)).forEach((v: Entity) => {
					v.render().forEach(vv => svg.appendChild(vv));
				});

				document.body.appendChild(svg);
			}
		}
	}
}
