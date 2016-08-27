import {Delaunay} from '../vendor/delaunay';

//TODO: Get scene.svg's poly bounds statically from an extrernal node loader

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

					} while (found != 25 && found != maxAttemts);

					return bounds.concat(extra);
				}).map(v => {
					return {
						verts: v,
						triangles: chunk(new Delaunay.Delaunay(v).triangles, 3)
					}
				});

				var svg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('viewBox', req.responseXML.querySelector('svg').getAttribute('viewBox'));

				zones.forEach(v => {
					v.triangles.forEach(vv => {
						var poly: SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
						poly.setAttribute('style', 'fill: black; stroke: white;');

						poly.setAttribute('stroke-linejoin', 'round');
						poly.setAttribute('stroke-miterlimit', '1');
						poly.setAttribute('stroke-width', '1');

						poly.setAttribute('points', vv.map(vvv => {
							return [v.verts[vvv][0], v.verts[vvv][1]]
						}));

						svg.appendChild(poly);
					});
				});

				document.body.appendChild(svg);
			}
		}
	}
}
