var d = require('delaunay-fast');

var vandal = function (el) {
	var _SVGNS = 'http://www.w3.org/2000/svg',
		code = {
			_DIFFUSE: [86, 200, 148],
			_AMBIENT: [25, 52, 65],
			_SIZE_OFFSET: 50,
			_COUNT: 250
		};

	code.vector = {
		add: function (a, b) {
			var _r = a;
			_r[0] += b[0];
			_r[1] += b[1];
			_r[2] += b[2];
			return _r;
		},
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
		multiplyScalar: function (a, s) {
			var _r = a;
			_r[0] *= s;
			_r[1] *= s;
			_r[2] *= s;
			return _r;
		},
		multiplyVectors: function (a, b) {
			var _r = [];
			_r[0] = a[0] * b[0];
			_r[1] = a[1] * b[1];
			_r[2] = a[2] * b[2];
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
		},
		min: function (target, value) {
			if (target[0] < value) {
				target[0] = value;
			}
			if (target[1] < value) {
				target[1] = value;
			}
			if (target[2] < value) {
				target[2] = value;
			}
			return this;
		},
		max: function (target, value) {
			if (target[0] > value) {
				target[0] = value;
			}
			if (target[1] > value) {
				target[1] = value;
			}
			if (target[2] > value) {
				target[2] = value;
			}
			return this;
		},
		clamp: function (target, min, max) {
			this.min(target, min);
			this.max(target, max);
			return this;
		},
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
		this.colour = new code.colour(code._AMBIENT);
		this.centroid = this.getCentroid();
		this.normal = this.getNormal();
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
			offsetX = 0,
			offsetY = this.height;

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
		this.pos = [(code.parentSize()[0] * (2 / 3)), (code.parentSize()[1] * (1 / 3)), 1];

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

			this.pos = [event.pageX, event.pageY, 1];
		}.bind(this);
	};

	code.light.prototype = {
		update: function (plane, run) {
			this._now = this.pos;
			this._last;

			if (run === true) {
				this._last = null;
			}

			if (!this._last || this._now[0] != this._last[0] || this._now[1] != this._last[1]) {
				if (!(this._last == this._now)) {
					_.each(plane.triangles, function (v) {
						var ray = code.vector.subtract(this.pos, v.centroid),
							n = code.vector.normalize(ray),
							ill = (code.vector.dot(v.normal, n));

						if (v.side === 0) {
							ill = Math.abs(ill);
						} else if (v.side === 1) {
							ill = Math.abs(Math.min(ill, 0));
						} else if (v.side === 2) {
							ill = Math.max(Math.abs(ill), 0);
						}

						var tRgb = code.vector.add(_.clone(v.colour.colour), code.vector.multiplyScalar(code.vector.multiplyVectors(code._DIFFUSE, code._AMBIENT), ill));
						tRgb = _.map(tRgb, function (v) {
							return Math.ceil(v);
						});

						var c = new code.colour(tRgb);
						c.shaded = tRgb;

						v.element.setAttributeNS(null, 'style', 'fill: ' + c.format() + '; stroke: ' + c.format());
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
		this.light = new code.light(this);
	};

	code.scene.prototype = {
		genPolygons: function () {
			var r = new code.render('g');
			_.each(this.plane.getPolygons(), function (triangle) {

				var polyPoints = [];
				_.each(triangle.getVertices(), function (p) {
					polyPoints.push(p.getXY());
				});

				var lum = ((Math.random() % 0.08));

				if (lum < 0.009) {
					triangle.side = 0;
				} else if (lum < 0.03) {
					triangle.side = 1;
				} else if (lum < 0.1) {
					triangle.side = 2;
				}

				triangle.colour = new code.colour(triangle.colour.shade(-1 * lum).shaded);

				triangle.element = r.polygon(polyPoints, triangle.colour.format(), code._STROKE);
			});

			return r.final();
		},
		getMap: function () {
			return this.map;
		},
		draw: function () {
			this.plane = new code.plane(code.parentSize()[0], code.parentSize()[1], code._COUNT);
			this.map.setAttribute('viewBox', '0 0 '+this.plane.getSize().join(' '));

			this.clear();

			this.map.appendChild(this.genPolygons());
			this.light.update(this.plane, true);
		},
		update: function () {
			this.light.update(this.plane);

		},
		clear: function () {
			for (var i = this.map.childNodes.length - 1; i >= 0; i--) {
				this.map.removeChild(this.map.childNodes[i]);
			}
		}
	};

	code.parentSize = function () {
		return [
			(el[0].offsetWidth + code._SIZE_OFFSET),
			(el[0].offsetHeight + code._SIZE_OFFSET)
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

		map.update();
	}

	requestAnimationFrame(draw);
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}
