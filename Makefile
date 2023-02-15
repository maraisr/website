serve:
	hugo serve -D --port 8080
.PHONY: serve

spell:
	npx cspell "content/**" -e "*.svg"
.PHONY: spell

format:
	npx prettier "**/*.{scss,js,md}" --write
.PHONY: format

build_only:
	rm -rf dist/ || exit 0
	hugo --minify -v --log --debug
.PHONY: build_only

build: download build_only
	mv dist/404/index.html dist/404.html
	./minify -vrs --html-keep-whitespace dist -o .
.PHONY: build

download:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.12.4/minify_linux_amd64.tar.gz > minify.tar.gz
	tar -xf minify.tar.gz
.PHONY: download
