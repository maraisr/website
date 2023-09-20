default: serve

.PHONY: serve
serve:
	hugo serve -D --bind 0.0.0.0 --port 8080

.PHONY: spell
spell:
	npx cspell "content/**" -e "*.svg"

.PHONY: format
format:
	npx prettier "**/*.{scss,js,md}" --write

build: minify dist

dist: layouts/*/* content/*/* assets/*/*
	rm -rf dist/ || exit 0
	hugo --minify --logLevel debug
	./minify/minify -vrs dist -o .
	touch dist

minify:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.12.8/minify_linux_amd64.tar.gz > minify.tar.gz
	mkdir -p minify
	tar -xf minify.tar.gz -C minify
	touch minify
