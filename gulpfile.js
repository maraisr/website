let gulp = require('gulp'),
	gutil = require('gulp-util'),
	connect = require('gulp-connect'),
	orderBy = require('lodash.orderby'),
	merge = require('lodash.merge'),
	moment = require('moment-timezone'),
	pkg = require('./package.json');

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
	DOMAIN: (process.env.NODE_ENV == 'production') ? pkg.config.domain : 'http://localhost:3303/'
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
					return JSON.parse(mustache.render(returns, PUG_LOCALS));
				})(JSON.stringify(require('./src/app/meta/fresh.json'))),
				_SKILLS: ((skills, returns) => {
					skills.list.forEach(zone => {
						zone.skills.forEach(skill => {
							returns.push({
								zone: zone.zone,
								skill: skill.replace(/[|](.*)$/, '').trim(),
								css: skill.replace(/^(.*)[|]/, '').trim()
							})
						});
					});

					return {
						list: orderBy(orderBy(returns, 'skill'), 'zone'),
						legend: skills.legend
					};
				})(require('./src/app/meta/skills.json'), [])
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
			steps.push(['postcss-pxtorem', {
				selectorBlackList: [/:root/i]
			}]);
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
		.pipe(gulp.dest('./dist/'))
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
gulp.task('fingerprint', ['default', 'misc'], () => {
	// TODO: This function needs to be cleaned up more, need promises etc..
	const fs = require('fs');
	const replace = require('gulp-replace');

	gulp.src('*.{css,js}', {cwd: './dist/'})
		.pipe(require('gulp-buster')())
		.on('data', (r) => {
			let hashes = JSON.parse(r.contents.toString());

			hashes = Object.keys(hashes).map(v => {
				return {orig: v, new: `${v.replace(/^(.*)\.(css|js)$/, `$1-${hashes[v].substr(0, 5)}.$2`)}`};
			});

			// Replace in html files
			((pip) => {
				hashes.forEach(hash => {
					pip.pipe(replace(hash.orig, hash.new));
				});
				return pip;
			})(gulp.src('./dist/*.html'))
				.pipe(gulp.dest('./dist'));

			// Rename files
			hashes.forEach(hash => {
				fs.rename(`./dist/${hash.orig}`, `./dist/${hash.new}`, (err) => {
					if (err != null) {
						throw err;
					}
				});
			});
		})
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
		.pipe(s3.publish(headers), 10)
		.pipe(s3.sync())
		.pipe(awsPub.reporter(rpt))
});
