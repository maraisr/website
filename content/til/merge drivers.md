---
title: merge drivers
date: 2022-08-10
---

> tl;dr when you encounter a merge conflict, use merge drivers to resolve them for you

Gee would'nt it be nice if one can
[define custom merge behaviors](https://git-scm.com/docs/gitattributes#_defining_a_custom_merge_driver) when dealing
with conflicts.

Well you can 🥳 with a thingy called _merge drivers_ and are defined per workspace, or in your `~/.gitconfig` global
config. In conjunction with `.gitattributes` files.

Most tools already support this out of the box, and all you need is a terminal executable runtime. eg `node x` or
`./my-app` etc.

### How?

You need to define the driver in a gitconfig file, either globally (`~/.gitconfig`) or in the project.

```ini
# file: ~/.gitconfig

[merge "relay"]
    name = relay compiler merge driver
    driver = relay-compiler

[merge "yarn"]
    name = yarn install
    driver = yarn install
```

... then in your project (or with
[`[core.gitattributes]`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreattributesFile)).

```ini
# file: .gitattributes

__geneated__/* merge=relay
yarn.lock merge=yarn
```

And done! ✨ Every time a merge conflict arises touching those files, the merge driver will run first trying to resolve
it.

But please do check the [documentation](https://git-scm.com/docs/gitattributes#_defining_a_custom_merge_driver) as to
how extend this further.

#### What makes this great?

Typically when dealing with generated files, or lockfiles as you're jumping between branches. Be nice for a piece of
code to quickly correct some files so you don't have local conflicting files. Yarn's lock file, or
[Relay](https://relay.dev)'s `__generated__` artifacts is notorious for this.
