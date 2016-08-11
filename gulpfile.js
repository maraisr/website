let gulp = require('gulp'),
	gutil = require('gulp-util'),
	connect = require('gulp-connect');

function plumb() {
	return require('gulp-plumber')({errorHandler: require('gulp-notify').onError("Error: <%= error.message %>")})
}

function webpackCallback(err, stats) {
	if (err) throw require('gulp-notify')()(err);

	gutil.log("[webpack]", stats.toString({
		colours: true,
		progress: true
	}));
}

gulp.task('default', ['images', 'js', 'scss', 'pug', 'fonts']);

gulp.task('watch', ['default'], () => {
	gulp.watch('./src/app/**/*.pug', ['pug']);
	gulp.watch('./src/assets/**/*.scss', ['scss']);

	require('webpack')(require('./webpack.config'))
		.watch({
			aggregateTimeout: 300,
			poll: true
		}, webpackCallback);
});

gulp.task('serve', ['watch'], () => {
	connect.server({
		livereload: true,
		root: ['./dist/'],
		port: 3303
	});
});

gulp.task('pug', () => {
	return gulp.src('./src/app/index.pug')
		.pipe(plumb())
		.pipe(require('gulp-pug')())
		.pipe(require('gulp-posthtml')([
			require('posthtml-minifier')({
				removeComments: true,
				collapseWhitespace: true,
				keepClosingSlash: true,
				sortClassName: true,
				minifyJS: true,
				minifyCSS: true
			})
		]))
		.pipe(gulp.dest('./dist/'))
		.pipe(connect.reload());
});

gulp.task('scss', () => {
	let srcMaps = require('gulp-sourcemaps');

	return gulp.src('./src/assets/scss/main.scss')
		.pipe(plumb())
		.pipe(srcMaps.init())
		.pipe(require('gulp-sass-bulk-import')())
		.pipe(require('gulp-sass')({
			importer: require('sass-module-importer')()
		}))
		.pipe(require('gulp-postcss')((() => {
			let steps = [],
				prfxOpts = {
					//http://browserl.ist/?q=chrome+%3E%3D+51%2C+ie+%3E%3D+11%2C+edge+%3E%3D13%2C+safari+%3E%3D+9.1
					browsers: [
						'chrome >= 50',
						'ie >= 11',
						'edge >=13',
						'safari >= 9.1'
					],
					cascade: false,
					supports: true,
					add: true,
					remove: true
				};

			steps.push('postcss-position');
			steps.push('lost');
			steps.push(['autoprefixer', prfxOpts]);

			if (process.env.NODE_ENV == 'production') {
				steps.push('css-mqpacker');
				steps.push(['cssnano', {
					discardComments: {removeAll: true},
					autoprefixer: prfxOpts,
					safe: false
				}]);
				steps.push(['postcss-sorting', {'sort-order': require('cssortie')}]);
			}

			return steps.map(v => {
				if (typeof v == 'object') {
					return require(v[0])(v[1]);
				}

				return require(v);
			});
		})()))
		.pipe(require('gulp-if')(!(process.env.NODE_ENV == 'production'), srcMaps.write()))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('fonts', () => {
	return gulp.src('./src/assets/fonts/**/*')
		.pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('images', () => {
	return gulp.src('./src/assets/img/**/*')
		.pipe(gulp.dest('./dist/img/'));
});

gulp.task('js', (done) => {
	require('webpack')(require('./webpack.config'))
		.run((err, stats) => {
			webpackCallback(err, stats);

			done();
		});
});
