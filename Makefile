serve:
	hugo serve -D
.PHONY: serve

build: download
	hugo --minify
	mv public/404/index.html public/404.html
	./minify -vrs public -o .
.PHONY: build

download:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.12.0/minify_linux_amd64.tar.gz > minify.tar.gz
	tar -xf minify.tar.gz
.PHONY: download