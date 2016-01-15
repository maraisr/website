var d = require('delaunay-fast');

var vandal = function (el) {
	var _SVGNS = 'http://www.w3.org/2000/svg',
		code = {},
		width = el[0].offsetWidth,
		height = el[0].offsetHeight;

	code.vertex = function (t, l) {
		this.get = function () {
			return [t, l]
		}
	};

	code.triangle = function (v) {
		var vertices = v;

		this.getVertices = function () {
			return vertices;
		}
	}

	code.plane = function (width, height, slices) {
		var that = this;

		this.width = width || 100;
		this.height = height || 100;
		this.triangles = [];

		var x, y, vertices = new Array(slices),
			offsetX = this.width * -0.5,
			offsetY = this.height * 0.5;

		for (i = vertices.length; i--;) {
			x = offsetX + Math.random() * width;
			y = offsetY - Math.random() * height;

			vertices[i] = [x, y];
		}

		vertices.push([offsetX, offsetY]);
		vertices.push([offsetX + width / 2, offsetY]);
		vertices.push([offsetX + width, offsetY]);
		vertices.push([offsetX + width, offsetY - height / 2]);
		vertices.push([offsetX + width, offsetY - height]);
		vertices.push([offsetX + width / 2, offsetY - height]);
		vertices.push([offsetX, offsetY - height]);
		vertices.push([offsetX, offsetY - height / 2]);

		for (var i = 6; i >= 0; i--) {
			vertices.push([offsetX + Math.random() * width, offsetY]);
			vertices.push([offsetX, offsetY - Math.random() * height]);
			vertices.push([offsetX + width, offsetY - Math.random() * height]);
			vertices.push([offsetX + Math.random() * width, offsetY - height]);
		}

		_(_.chunk(d.triangulate(vertices), 3)).map(function (v) {
			var verticess = [];
			_.each(v, function (point) {
				verticess.push(new code.vertex(vertices[point][0], vertices[point][1]));
			});

			that.triangles.push(new code.triangle(verticess));
		}).value();
	};

	code.plane.prototype = {
		getPairs: function () {
			var edgeToAdj = function (edgelist) {
				var adjlist = {};
				var i, len, pair, u, v;
				for (i = 0, len = edgelist.length; i < len; i += 1) {
					pair = edgelist[i];
					u = pair[0];
					v = pair[1];
					if (adjlist[u]) {
						adjlist[u].push(v);
					} else {
						adjlist[u] = [v];
					}
					if (adjlist[v]) {
						adjlist[v].push(u);
					} else {
						adjlist[v] = [u];
					}
				}
				return adjlist;
			};
			var bfs = function (v, adjlist, visited) {
				var q = [];
				var current_group = [];
				var i, len, adjV, nextVertex;
				q.push(v);
				visited[v] = true;
				while (q.length > 0) {
					v = q.shift();
					current_group.push(v);
					adjV = adjlist[v];
					for (i = 0, len = adjV.length; i < len; i += 1) {
						nextVertex = adjV[i];
						if (!visited[nextVertex]) {
							q.push(nextVertex);
							visited[nextVertex] = true;
						}
					}
				}
				return current_group;
			};

			var groups = [],
				visited = {},
				v;

			var pairs = [];
			_.each(this.triangles, function (v) {
				_.each(v.getVertices(), function (v) {
					pairs.push(v.get());
				})
			});

			var adjlist = edgeToAdj(pairs);

			for (v in adjlist) {
				if (adjlist.hasOwnProperty(v) && !visited[v]) {
					groups.push(bfs(v, adjlist, visited));
				}
			}

			return _.slice(groups, 1);
		},
		getPolygons: function () {
			return this.triangles;
		}
	};

	code.scene = function () {
		this.plane = new code.plane(width * 2, height * 2, 400);

		this.map = document.createElementNS(_SVGNS, 'svg');
		this.map.setAttribute('width', width);
		this.map.setAttribute('height', height);
	};

	code.scene.prototype = {
		genPolygons: function () {
			var polygons = document.createElementNS(_SVGNS, 'g');

			_.each(this.plane.getPolygons(), function (triangle) {
				var points = triangle.getVertices(),
					polygon = document.createElementNS(_SVGNS, 'polygon');

				polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
				polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
				polygon.setAttributeNS(null, 'stroke-width', '1');

				var polyPoints = [];
				_.each(points, function (p) {
					polyPoints.push(p.get().join(','));
				});

				polygon.setAttributeNS(null, 'points', polyPoints.join(' '));
				polygon.setAttributeNS(null, 'style', 'fill: #3E606F; stroke: #91AA9D;');

				polygons.appendChild(polygon);
			});

			return polygons;
		},
		getPoints: function () {
			var dots = document.createElementNS(_SVGNS, 'g');
			_.each(this.plane.getPairs(), function (d) {
				var dot = document.createElementNS(_SVGNS, 'circle');
				dot.setAttributeNS(null, 'cx', d[0]);
				dot.setAttributeNS(null, 'cy', d[1]);
				dot.setAttributeNS(null, 'r', 4);
				dot.setAttributeNS(null, 'style', 'fill: #91AA9D');
				dots.appendChild(dot);
			}.bind(this));
			return dots;
		},
		getMap: function () {
			return this.map;
		},
		draw: function () {
			this.clear();
			this.map.appendChild(this.genPolygons());
			this.map.appendChild(this.getPoints());
		},
		clear: function () {
			for (var i = this.map.childNodes.length - 1; i >= 0; i--) {
				this.map.removeChild(this.map.childNodes[i]);
			}
		}
	};

	var map = new code.scene();

	el[0].appendChild(map.getMap());

	map.draw();

	// Eventually we'll need the animation frame
	/*var last;

	 function draw(now) {
	 requestAnimationFrame(draw);
	 if (!last || now - last >= 2 * 1000) {
	 last = now;
	 map.draw();
	 }
	 }

	 requestAnimationFrame(draw);*/
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}