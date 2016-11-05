const gulp = require('gulp'),
	gutil = require('gulp-util'),
	connect = require('gulp-connect'),
	orderBy = require('lodash.orderby'),
	merge = require('lodash.merge'),
	moment = require('moment-timezone'),
	pkg = require('./package.json'),
	rimraf = require('rimraf'),
	parallelize = require("concurrent-transform");

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

var PUG_LOCALS = {
	LASTMOD: moment.tz(pkg.config.loc).format(),
	DOMAIN: (process.env.NODE_ENV == 'production') ? pkg.config.domain : 'http://localhost:3303/',
	VERSION: pkg.version
};

gulp.task('default', ['images', 'js', 'scss', 'pug', 'fonts', 'images']);

gulp.task('watch', ['default'], () => {
	gulp.watch('./src/app/**/*.pug', ['pug']);
	gulp.watch('./src/assets/**/*.scss', ['scss']);
	gulp.watch('./src/assets/img/**/*', ['images']);

	require('webpack')(require('./webpack.config'))
		.watch({
			aggregateTimeout: 300,
			poll: true
		}, webpackCallback);
});

gulp.task('clean', (done) => {
	return rimraf('./dist/**/*', done);
});

gulp.task('serve', ['watch'], () => {
	connect.server({
		livereload: true,
		root: ['./dist/'],
		port: 3303
	});
});

gulp.task('pug', () => {
	let mustache = require('mustache');

	return gulp.src('./src/app/[!_]*.pug')
		.pipe(plumb())
		.pipe(require('gulp-pug')({
			doctype: 'html5',
			pretty: false,
			locals: (function (def) {
				return merge(def, PUG_LOCALS);
			})({
				moment: moment,
				LOC: pkg.config.loc,
				SITE: require('./src/app/meta/site.json'),
				FRESH: ((returns) => {
					returns = JSON.parse(mustache.render(returns, PUG_LOCALS));

					// Limit to last 4
					let limit = 4;

					if (returns.employment.history.length > limit) {
						returns.employment.history = returns.employment.history.splice(returns.employment.history.length - limit, limit);
					}

					return returns;
				})(JSON.stringify(require('./src/app/meta/fresh.json'))),
				_SKILLS: (([legend, fresh], returns) => {
					fresh.skills.sets.forEach(item => item.skills.forEach(skillItem => returns.push({
						zone: item.name,
						skill: skillItem,
						css: item.level
					})));

					return {
						list: orderBy(orderBy(returns, 'skill'), 'zone'),
						legend: legend
					};
				})([require('./src/app/meta/skills-legend.json'), require('./src/app/meta/fresh.json')], [])
			})
		}))
		.pipe(require('gulp-posthtml')(((returns) => {
			returns.push(require('posthtml-minifier')({
				removeComments: true,
				collapseWhitespace: true,
				keepClosingSlash: true,
				sortClassName: true,
				minifyJS: true,
				minifyCSS: true
			}));

			if (process.env.NODE_ENV == 'production') {
				returns.push(require('posthtml-schemas')());
				returns.push(require('posthtml-json')());
				returns.push(require('posthtml-obfuscate')());
			}

			return returns;
		})([])))
		.pipe(gulp.dest('./dist/'))
		.pipe(connect.reload());
});

gulp.task('scss', () => {
	let srcMaps = require('gulp-sourcemaps');

	let returns = gulp.src('./src/assets/scss/main.scss')
		.pipe(plumb())
		.pipe(srcMaps.init())
		.pipe(require('gulp-sass-bulk-import')())
		.pipe(require('gulp-sass')({
			importer: require('sass-module-importer')()
		}))
		.pipe(require('gulp-postcss')((() => {
			let steps = [],
				prfxOpts = {
					//http://browserl.ist/?q=chrome+%3E%3D+51%2C+ie+%3E%3D+11%2C+edge+%3E%3D13%2C+safari+%3E%3D+9.1%2C+and_chr+%3E%3D+51%2C+ios+%3E+9.2
					browsers: [
						'chrome >= 50',
						'ie >= 11',
						'edge >=13',
						'safari >= 9.1',
						'and_chr >= 51',
						'ios > 9.2'
					],
					cascade: false,
					supports: true,
					add: true,
					remove: true
				};

			steps.push('postcss-position');
			steps.push('lost');
			steps.push(['postcss-pxtorem', {
				selectorBlackList: [/:root/i]
			}]);
			steps.push(['autoprefixer', prfxOpts]);

			if (process.env.NODE_ENV == 'production') {
				steps.push('css-mqpacker');

				// Sorts media queries
				steps.push(['EXTRA', function () {
					return function (tree) {
						let nodes = [];

						tree.walkAtRules('media', (v) => {
							if (/([0-9]+)px/.test(v.params)) {
								nodes.push(v);
								v.remove();
							}
						});

						function getPx(params) {
							let num = /([0-9]+)px/.exec(params);
							return parseInt(num[1]);
						}

						tree.append(nodes.sort((a, b) => {
							return getPx(a.params) > getPx(b.params);
						}));
					}
				}()]);

				steps.push(['postcss-sorting', {'sort-order': require('cssortie')}]);
				steps.push(['cssnano', {
					discardComments: {removeAll: true},
					autoprefixer: prfxOpts,
					safe: false
				}]);
			}

			return steps.map(v => {
				if (typeof v == 'object') {
					if (v[0] == 'EXTRA') {
						return v[1];
					}

					return require(v[0])(v[1]);
				}

				return require(v);
			});
		})()));

	if (process.env.NODE_ENV != 'production') {
		returns.pipe(srcMaps.write());
	}

	return returns.pipe(gulp.dest('./dist/'))
		.pipe(connect.reload());
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
	require('webpack')(require('./webpack.config.js'))
		.run((err, stats) => {
			webpackCallback(err, stats);

			done();
		});
});

gulp.task('misc', () => {
	return gulp.src(['./src/misc/**/*', './src/app/meta/fresh.json'])
		.pipe(require('gulp-mustache')(PUG_LOCALS))
		.pipe(require('gulp-pretty-data')({type: 'minify'}))
		.pipe(require('gulp-rename')(function (returns) {
			if (returns.basename == 'fresh') {
				returns.basename = 'resume'
			}
		}))
		.pipe(gulp.dest('./dist'))
});

// If you want GZIP, using ['gzip'] here.
gulp.task('fingerprint', ['default', 'misc'], (done) => {
	const revAll = require('gulp-rev-all');
	let myRev = new revAll({dontRenameFile: ['.html']});

	gulp.src('./dist/**/*.{css,js,html}')
		.pipe(myRev.revision())
		.pipe(gulp.dest('./dist/'))
		.on('end', () => {
			rimraf('./dist/main.{css,js}', done);
		});
});

gulp.task('gzip', ['default', 'misc'], () => {
	return gulp.src('./dist/**/*')
		.pipe(require('gulp-gzip')({
			append: false,
			gzipOptions: {
				level: 9
			}
		}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('publish', ['fingerprint'], () => {
	var awsPub = require('gulp-awspublish');

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
			'Cache-Control': 'max-age=1209600'
		},
		s3base = {
			accessKeyId: s3config['accessKeyId'],
			secretAccessKey: s3config['secretAccessKey'],
			region: 'ap-southeast-2',
			params: {
				Bucket: s3config['bucket']
			}
		},
		rpt = {states: ['create', 'update', 'delete']},
		s3 = awsPub.create(s3base);

	return gulp.src('**/*', {cwd: 'dist/'})
		.pipe(parallelize(s3.publish(headers), 10))
		.pipe(s3.sync())
		.pipe(awsPub.reporter(rpt))
});
