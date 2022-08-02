.PHONY: build
build: install
	pnpm run build
	mv public/404/index.html public/404.html
	./minify -vrs public -o .

.PHONY: install
install: download
	pnpm install

.PHONY: download
download:
	curl -L https://github.com/tdewolff/minify/releases/download/v2.12.0/minify_linux_amd64.tar.gz > minify.tar.gz
	tar -xf minify.tar.gz
	npm install -g pnpm