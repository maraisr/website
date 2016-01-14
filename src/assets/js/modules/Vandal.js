var d = require('delaunay-fast');

var vandal = function (el) {

	var code = {},
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

		return this.triangles;
	};

	(function (p) {
		var _SVGNS = 'http://www.w3.org/2000/svg',
			polygons = document.createElementNS(_SVGNS, 'svg');

		polygons.setAttribute('width', width);
		polygons.setAttribute('height', height);

		_.each(p, function (triangle) {
			var points = triangle.getVertices(),
				polygon = document.createElementNS(_SVGNS, 'polygon');

			polygon.setAttributeNS(null, 'stroke-linejoin', 'round');
			polygon.setAttributeNS(null, 'stroke-miterlimit', '1');
			polygon.setAttributeNS(null, 'stroke-width', '1');

			var polyPoints = [];
			_.each(points, function (p) {
				polyPoints.push(p.get().join(','))
			});

			polygon.setAttributeNS(null, 'points', polyPoints.join(' '));
			polygon.setAttributeNS(null, 'style', 'fill: #3E606F; stroke: #91AA9D;');

			polygons.appendChild(polygon);
		});

		el[0].appendChild(polygons);
	})(new code.plane(width * 2, height * 2, 400));
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}