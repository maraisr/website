var d = require('delaunay-fast');

var vandal = function (el) {
	var _SVGNS = 'http://www.w3.org/2000/svg',
		code = {
			_FILL: '#101010',
			_STROKE: '#383838',
			_SIZE_OFFSET: 50
		};

	code.vertex = function (x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z || 0;
	};

	code.vertex.prototype = {
		get: function () {
			return [
				this.x,
				this.y,
				this.z
			]
		},
		getZY: function () {
			return [
				this.x,
				this.y
			]
		}
	}

	code.triangle = function (v) {
		this.vertices = v;
	}

	code.vector3 = {
		divideScalar: function (target, s) {
			if (s !== 0) {
				target[0] /= s;
				target[1] /= s;
				target[2] /= s;
			} else {
				target[0] = 0;
				target[1] = 0;
				target[2] = 0;
			}
			return this;
		}
	}

	code.triangle.prototype = {
		getVertices: function () {
			return this.vertices;
		},
		getCentroid: function () {
			var c = _(this.getVertices())
				.map(function (v) {
					return _.sum(v.get());
				}).value();

			code.vector3.divideScalar(c, 3);

			return c;
		}
	}

	code.plane = function (width, height, slices) {
		this.width = width;
		this.height = height;
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
			this.triangles.push(new code.triangle(_(v).map(function (point) {
				return new code.vertex(vertices[point][0], vertices[point][1]);
			}).value()));
		}.bind(this)).value();
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
					pairs.push(v.getZY());
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
		},
		getSize: function () {
			return [
				this.width,
				this.height
			];
		}
	};

	code.scene = function () {
		this.map = document.createElementNS(_SVGNS, 'svg');
	};

	code.scene.prototype = {
		genPolygons: function () {
			var polygons = document.createElementNS(_SVGNS, 'g');

			_.each(this.plane.getPolygons(), function (triangle) {
				var points = triangle.getVertices(),
					polygon = document.createElementNS(_SVGNS, 'polygon');

				triangle.getCentroid();

				polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
				polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
				polygon.setAttributeNS(null, 'stroke-width', '1');

				var polyPoints = [];
				_.each(points, function (p) {
					polyPoints.push(p.getZY().join(','));
				});

				polygon.setAttributeNS(null, 'points', polyPoints.join(' '));
				polygon.setAttributeNS(null, 'style', 'fill: ' + code._FILL + '; stroke: ' + code._STROKE + ';');

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
				dot.setAttributeNS(null, 'style', 'fill: ' + code._STROKE);
				dots.appendChild(dot);
			}.bind(this));
			return dots;
		},
		getMap: function () {
			return this.map;
		},
		draw: function () {
			this.plane = new code.plane(code.parentSize()[0], code.parentSize()[1], 400);
			this.map.setAttribute('width', (this.plane.getSize()[0] / 2));
			this.map.setAttribute('height', (this.plane.getSize()[1] / 2));

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

	code.parentSize = function () {
		return [
			(el[0].offsetWidth + code._SIZE_OFFSET) * 2,
			(el[0].offsetHeight + code._SIZE_OFFSET) * 2
		];
	};

	var map = new code.scene();
	el[0].appendChild(map.getMap());

	var last;

	function draw() {
		requestAnimationFrame(draw);

		var now = code.parentSize();

		if (!last || last[0] != now[0] || last[1] != last[1]) {
			map.draw();
			last = now;
		}
	}

	requestAnimationFrame(draw);
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}