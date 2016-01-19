var d = require('delaunay-fast');

var vandal = function (el) {
	var _SVGNS = 'http://www.w3.org/2000/svg',
		code = {
			_FILL: '#101010',
			_STROKE: '#383838',
			_SIZE_OFFSET: 50,
			_COUNT: 800
		};

	code.vector = {
		subtract: function (a, b) {
			var _r = [];
			_r[0] = a[0] - b[0];
			_r[1] = a[1] - b[1];
			_r[2] = a[2] - b[2];
			return _r;
		},
		divideScalar: function (a, l) {
			var _r = [];

			_.each(a, function (v, k) {
				_r[k] = ((v == 0) ? 0 : (v / l));
			});

			return _r;
		},
		cross: function (a, b) {
			var _r = [];
			_r[0] = a[1] * b[2] - a[2] * b[1];
			_r[1] = a[2] * b[0] - a[0] * b[2];
			_r[2] = a[0] * b[1] - a[1] * b[0];
			return _r;
		},
		normalize: function (a) {
			return this.divideScalar(a, this.length(a));
		},
		length: function (a) {
			return Math.sqrt(this.lengthSquared(a));
		},
		lengthSquared: function (a) {
			return a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
		},
		distanceSquared: function (a, b) {
			var dx = a[0] - b[0];
			var dy = a[1] - b[1];
			var dz = a[2] - b[2];
			return dx * dx + dy * dy + dz * dz;
		},
		distance: function (a, b) {
			return Math.sqrt(this.distanceSquared(a, b));
		},
		dot: function (a, b) {
			return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		}
	}

	code.colour = function (colour) {
		this.colour = colour;
		this.shaded = [0, 0, 0];
	};

	code.colour.prototype = {
		//http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		shade: function (percent) {
			var f = this.colour, t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f[0], G = f[1], B = f[2];
			this.shaded = [(Math.round((t - R) * p) + R), (Math.round((t - G) * p) + G), (Math.round((t - B) * p) + B)];
			return this;
		},
		format: function () {
			return 'rgb(' + this.shaded.join(',') + ')';
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
		getXY: function () {
			return [
				this.x,
				this.y
			]
		}
	}

	code.triangle = function (v) {
		this.vertices = v;
		this.colour = new code.colour([16, 16, 16]);
		this.centroid = this.getCentroid();
		//this.normal = this.getNormal();

		this._dirty = false;
	}

	code.triangle.prototype = {
		getVertices: function () {
			return this.vertices;
		},
		getCentroid: function () {
			var vertices = this.getVertices(),
				vertices = code.vector.divideScalar([
					_.sum([vertices[0].get()[0], vertices[1].get()[0], vertices[2].get()[0]]),
					_.sum([vertices[0].get()[1], vertices[1].get()[1], vertices[2].get()[1]]),
					_.sum([vertices[0].get()[2], vertices[1].get()[2], vertices[2].get()[2]])
				], 3);

			return vertices;
		},
		getNormal: function () {
			var u = code.vector.subtract(this.vertices[1].get(), this.vertices[0].get()),
				v = code.vector.subtract(this.vertices[2].get(), this.vertices[0].get()),
				c = code.vector.cross(u, v),
				n = code.vector.normalize(c);

			return n;
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
					pairs.push(v.getXY());
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

	code.light = function () {
		// TODO: Start mouse pos 2/3 from the left of the monitor, and 1/3 from the top
		this.pos = [0, 0, 0];

		document.onmousemove = function (event) {
			var dot, eventDoc, doc, body, pageX, pageY,
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

			this.pos = [event.pageX, event.pageY, 0];
		}.bind(this);
	};

	code.light.prototype = {
		update: function (triangles) {
			this._now = this.pos;
			this._last;

			if (!this._last || this._now[0] != this._last[0] || this._now[1] != this._last[1]) {
				if (!(this._last == this._now)) {
					var deltas = _(triangles)
						.map(function (v, k) {

							/*var ray = code.vector.subtract(this.pos, v.centroid),
								n = code.vector.normalize(this.pos),

								ill = code.vector.dot(v.normal, ray);*/

							/*console.log('a', Math.max(ill, 0));

							 console.log('b', Math.abs(Math.min(ill, 0)));

							 console.log('c', Math.max(Math.abs(ill), 0));*/

							return {
								index: k,
								delta: code.vector.distance(this.pos, v.centroid)
							}
						}.bind(this)).sortBy('delta').value();

					var count = deltas.length;

					_.each(deltas, function (v, k) {
						var c = new code.colour([232, 12, 122]),
							lum = (k / (count * 0.2));

						c.shade(-1 * lum);
						triangles[v.index].element.setAttributeNS(null, 'style', 'fill: ' + c.format() + '; stroke: ' + c.format());
					}.bind(this));
				}

				this._last = this._now;
			}
		}
	};

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

			return dot;
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
		this.light = new code.light();
	};

	code.scene.prototype = {
		genPolygons: function () {
			var r = new code.render('g');
			_.each(this.plane.getPolygons(), function (triangle) {

				var polyPoints = [];
				_.each(triangle.getVertices(), function (p) {
					polyPoints.push(p.getXY());
				});

				triangle.element = r.polygon(polyPoints, triangle.colour.shade(-1 * ((Math.random() % 0.4))).format(), code._STROKE);
			});

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
		},
		update: function () {
			this.light.update(this.plane.getPolygons());

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

	function draw(ts) {
		requestAnimationFrame(draw);

		var now = code.parentSize();

		if (!last || last[0] != now[0] || last[1] != last[1]) {
			map.draw();
			last = now;
		}

		map.update();
	}

	requestAnimationFrame(draw);
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}
