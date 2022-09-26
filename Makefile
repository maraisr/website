serve:
	hugo serve -D --port 8080
.PHONY: serve

format:
	npx prettier "**/*.{scss,js,md}" --write
.PHONY: format

build_only:
	hugo --minify
.PHONY: build_only

build: download build_only
	mv public/404/index.html public/404.html
	./minify -vrs public -o .
.PHONY: build

download:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.12.0/minify_linux_amd64.tar.gz > minify.tar.gz
	tar -xf minify.tar.gz
.PHONY: download
