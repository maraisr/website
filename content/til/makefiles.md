---
title: makefiles
summary: How I use Makefiles
date: 2023-09-13
tags: [build]
---

I never used to know how Makefiles work, and still don't know how they work fully. But this is just noting how I use
them.

The basic anatomy of a Makefile is:

```makefile
task: deps
  echo "do something"
```

- `task` can be the name of _something_ you want to do, like `build`, `serve`, `test` etc. Or be a resulting file/folder
  name, like `dist/`.
- `deps` are a list of dependencies that need to be resolved before the task can run. These can be files, folders, or
  other tasks.

So if I wanted to build a project, I'd have a `build` task that depends on `node_modules` and the `src` folder, which
produces the `dist/` folder:

```makefile
default: dist

dist: node_modules src/**
  npm run build

node_modules: package.json
  npm install

# Other tasks
# --------------------------

format: node_modules
  npm run format
.PHONY: format
```

Running `make` will do something like this:

```shell
make
  Running 'npm install'...
  Running 'npm run build'...

touch src/index.html            # trigger a change to a dep

make
  Running 'npm run build'...    # notice no `npm install` as it's already installed

make format
  Running 'npm run format'...   # format will always run as its PHONY
```
