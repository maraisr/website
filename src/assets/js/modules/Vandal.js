var d = require('delaunay-fast');

var vandal = function (el) {
	var _SVGNS = 'http://www.w3.org/2000/svg',
		code = {
			_FILL: '#101010',
			_STROKE: '#383838',
			_SIZE_OFFSET: 50,
			_COUNT: 200
		};

	code.colour = function (lum) {
		this.rgb = this.shadeRGBColor([16, 16, 16], (-1 * (lum)));
	};

	code.colour.prototype = {
		//http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		shadeRGBColor: function (colour, percent) {
			var f = colour, t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f[0], G = f[1], B = f[2];
			return [(Math.round((t - R) * p) + R), (Math.round((t - G) * p) + G), (Math.round((t - B) * p) + B)];
		},
		format: function () {
			return 'rgb(' + this.rgb.join(',') + ')';
		}
	}

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
		this.colour = new code.colour((Math.random() % 0.4));
		this.centroid = this.getCentroid();
	}

	code.triangle.prototype = {
		getVertices: function () {
			return this.vertices;
		},
		getCentroid: function () {
			var vertices = this.getVertices(),
				vertices = [
					_.sum([vertices[0].get()[0], vertices[1].get()[0], vertices[2].get()[0]]),
					_.sum([vertices[0].get()[1], vertices[1].get()[1], vertices[2].get()[1]]),
					_.sum([vertices[0].get()[2], vertices[1].get()[2], vertices[2].get()[2]])
				];

			_.each(vertices, function (v, k) {
				vertices[k] = v / 3;
			});

			return vertices;
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

	code.mesh = function (scene) {
		this.scene = scene;
	};

	code.mesh.prototype = {
		run: function () {

		}
	};

	code.light = function () {
		this.pos = [];

		document.onmousemove = function (event) {
			var dot, eventDoc, doc, body, pageX, pageY;

			event = event || window.event;

			if (event.pageX == null && event.clientX != null) {
				eventDoc = (event.target && event.target.ownerDocument) || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = event.clientY +
					(doc && doc.scrollTop || body && body.scrollTop || 0) -
					(doc && doc.clientTop || body && body.clientTop || 0 );
			}

			this.pos = [event.pageX, event.pageY];
		}.bind(this);
	};

	code.light.prototype = {};

	code.render = function (type) {
		this.s = document.createElementNS(_SVGNS, type);
	};

	code.render.prototype = {
		point: function (x, y) {
			var dot = document.createElementNS(_SVGNS, 'circle');
			dot.setAttributeNS(null, 'cx', x);
			dot.setAttributeNS(null, 'cy', y);
			dot.setAttributeNS(null, 'r', 4);
			dot.setAttributeNS(null, 'style', 'fill: ' + code._STROKE);
			this.s.appendChild(dot);
		},
		polygon: function (points, fill, stroke) {
			var polygon = document.createElementNS(_SVGNS, 'polygon');

			polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
			polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
			polygon.setAttributeNS(null, 'stroke-width', '1');

			polygon.setAttributeNS(null, 'points', _(points).map(function (v) {
				return v.join(',')
			}).value().join(' '));
			polygon.setAttributeNS(null, 'style', 'fill: ' + fill + '; stroke: ' + stroke + ';');

			this.s.appendChild(polygon);

			return polygon;
		},
		final: function () {
			return this.s;
		}
	}

	code.scene = function () {
		this.map = document.createElementNS(_SVGNS, 'svg');
		this.mesh = new code.mesh(this);
	};

	code.scene.prototype = {
		genPolygons: function () {
			var r = new code.render('g');
			_.each(this.plane.getPolygons(), function (triangle) {

				var polyPoints = [];
				_.each(triangle.getVertices(), function (p) {
					polyPoints.push(p.getZY());
				});

				triangle.element = r.polygon(polyPoints, triangle.colour.format(), code._STROKE);
			});

			return r.final();
		},
		genPoints: function () {
			var r = new code.render('g');
			_.each(this.plane.getPairs(), function (d) {
				r.point(d[0], d[1]);
			}.bind(this));
			return r.final();
		},
		getMap: function () {
			return this.map;
		},
		draw: function () {
			this.plane = new code.plane(code.parentSize()[0], code.parentSize()[1], code._COUNT);
			this.map.setAttribute('width', (this.plane.getSize()[0] / 2));
			this.map.setAttribute('height', (this.plane.getSize()[1] / 2));

			this.clear();

			this.map.appendChild(this.genPolygons());
			//this.map.appendChild(this.genPoints());

			/*var r = new code.render('g');
			 _.each(this.plane.getPolygons(), function (v) {
			 r.point(v.centroid[0], v.centroid[1]);
			 }.bind(this));

			 this.map.appendChild(r.final());*/
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