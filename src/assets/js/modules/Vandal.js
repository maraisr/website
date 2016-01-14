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
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext('2d');

		_.each(p, function (triangle) {
			var points = triangle.getVertices();

			context.beginPath();
			context.moveTo(_.first(points).get()[0], _.first(points).get()[1]);
			_.each(_.slice(points, 0), function (p) {
				context.lineTo(p.get()[0], p.get()[1]);
			});
			context.closePath();
			context.strokeStyle = '#91AA9D';
			context.fillStyle = '#3E606F';
			context.stroke();
			context.fill();
		});

		el[0].appendChild(canvas);

	})(new code.plane(width * 2, height * 2, 400))
}

module.exports = {
	start: function (el) {
		return new vandal(el);
	}
}