default: serve

.PHONY: serve
serve:
	hugo serve -D --bind 0.0.0.0 --port 8080

.PHONY: spell
spell:
	bunx cspell "content/**" -e "*.svg"

.PHONY: format
format:
	bunx --bun prettier --print-width=120 --prose-wrap=always --write "**/*.{css,js,md}"

build: minify dist

dist: minify layouts/*/* content/*/* assets/*/*
	rm -rf dist/ || exit 0
	hugo --minify --logLevel debug
	./minify/minify -vrs dist -o .
	touch dist

minify:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.20.37/minify_linux_amd64.tar.gz > minify.tar.gz
	mkdir -p minify
	tar -xf minify.tar.gz -C minify
	touch minify
