var gulp = require('gulp'),
	$ = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'webpack']
	}),
	gutil = require('gulp-util'),
	_ = require('lodash');

function webpackCallback(err, stats) {
	if (err) throw $.notify(err);

	gutil.log("[webpack]", stats.toString({
		colours: true,
		progress: true
	}));
}

function plumberError() {
	return $.plumber({ errorHandler: $.notify.onError("Error: <%= error.message %>") })
}

// Main tasks
gulp.task('pug', function () {
	return gulp.src('./src/public/**/[^_]*.pug')
		.pipe(plumberError())
		.pipe($.pug())
		.pipe(gulp.dest('./dist/'))
		.pipe($.connect.reload());
});

gulp.task('webpack', function (done) {
	$.webpack(require('./webpack.config.js'))
		.run(function (err, stats) {
			webpackCallback(err, stats);

			done();
		});
});

gulp.task('scss', function () {
	return gulp.src('./src/public/assets/scss/entry.scss')
		.pipe(plumberError())
		.pipe($.sass({
			importer: require('sass-module-importer')()
		}))
		.pipe($.postcss((function (res) {
			res.push(require('autoprefixer')({
				browsers: ['last 1 version'],
				cascade: false,
				add: true
			}));

			res.push(require('lost'));
			res.push(require('postcss-position'));

			if (process.env.NODE_ENV == 'production') {
				res.push(require('cssnano')({
					discardComments: {
						removeAll: true
					}
				}));
				res.push(require('css-mqpacker'));
			}

			res.push(require('postcss-sorting')({ 'sort-order': require('cssortie') }))

			return res;
		})([])))
		.pipe($.rename({ basename: 'main' }))
		.pipe(gulp.dest('./dist/'))
		.pipe($.connect.reload());
});

gulp.task('images', function () {
	return gulp.src('./src/public/assets/imgs/**/*')
		.pipe($.imagemin())
		.pipe(gulp.dest('./dist/imgs/'));
});

gulp.task('fonts', function () {
	return gulp.src('./src/public/assets/fonts/**.*')
		.pipe(gulp.dest('./dist/fonts/'))
});

// Build process
gulp.task('watch', function () {
	$.webpack(require('./webpack.config.js'))
		.watch({
			aggregateTimeout: 300,
			poll: true
		}, webpackCallback);

	gulp.watch('./src/public/**/*.pug', ['pug']);
	gulp.watch('./src/public/assets/scss/**/*.scss', ['scss']);
	gulp.watch('./src/public/assets/imgs/**/*', ['images']);
	gulp.watch('./src/public/assets/fonts/**.*', ['fonts']);
});

// Compile
gulp.task('build', ['clean'], function (done) {
	$.env.set({
		NODE_ENV: 'production'
	});

	$.sequence(['webpack', 'pug', 'scss', 'images', 'fonts'], 'optim', done);
});

gulp.task('optim', function () {
	return gulp.src('./dist/**/*.html')
		.pipe($.htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			sortClassName: true,
			minifyJS: true,
			minifyCSS: true
		}))
		.pipe(gulp.dest('./dist/'));
});

// Dev server
gulp.task('serve', function () {
	$.connect.server({
		livereload: true,
		port: process.env.PORT || 3303,
		root: ['./dist/']
	});
});

gulp.task('default', ['watch', 'serve']);

gulp.task('clean', function () {
	return gulp.src('./dist')
		.pipe($.clean());
})

gulp.task('gzip', ['build'], function () {
	return gulp.src('./dist/**/*')
		.pipe($.gzip({
			append: false
		}))
		.pipe(gulp.dest('./dist/'))
})

gulp.task('publish', ['gzip'], function () {
	var s3config = (function () {
		if (process.env.S3_BUCKET) {
			return {
				accessKeyId: process.env.S3_ACCESS_ID,
				secretAccessKey: process.env.S3_ACCESS_KEY,
				bucket: process.env.S3_BUCKET
			}
		} else {
			return require('./s3config.json');
		}
	})();

	var headers = {
		'Content-Encoding': 'gzip'
	},
		s3base = {
			accessKeyId: _.get(s3config, 'accessKeyId'),
			secretAccessKey: _.get(s3config, 'secretAccessKey'),
			region: 'ap-southeast-2',
			params: {
				Bucket: _.get(s3config, 'bucket')
			}
		},
		rpt = { states: ['create', 'update', 'delete'] },
		s3 = $.awspublish.create(s3base);

	return gulp.src('**/*', { cwd: 'dist/' })
		.pipe(s3.publish(headers), 10)
		.pipe(s3.sync())
		.pipe($.awspublish.reporter(rpt))
});
