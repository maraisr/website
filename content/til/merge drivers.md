---
title: merge drivers
date: 2022-07-12
tags: [git]
---

> tl;dr have a consistent merge conflict, use merge drivers to resolve them for you

I often faced resolving the same file, the same way. And wondered, can't git just solve this for me?

Well you can 🥳 with a thingy called
[_merge drivers_](https://git-scm.com/docs/gitattributes#_defining_a_custom_merge_driver) which are defined either per
workspace, or in your `~/.gitconfig` global config — and joined with `.gitattributes` files.

All you need is an executable—`node fix-my-file.js`, `./file-resolver` etc.

### How?

You need to define the driver in a gitconfig file, either globally (`~/.gitconfig`) or in the project.

```toml {title="~/.gitconfig"}
[merge "relay"]
    name = relay compiler merge driver
    driver = relay-compiler

[merge "yarn"]
    name = yarn install
    driver = yarn install
```

... then in your project (or with
[`[core.gitattributes]`](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreattributesFile)).

```ini {title=".gitattributes"}
__generated__/*  merge = relay
yarn.lock        merge = yarn
```

And done! ✨ Every time a merge conflict arises touching those files, the merge driver will run first trying to resolve
it.

But please do check the [documentation](https://git-scm.com/docs/gitattributes#_defining_a_custom_merge_driver) as to
how extend this further.

#### What makes this great?

Typically when dealing with generated files, or lockfiles as you're jumping between branches. Be nice for a piece of
code to quickly correct some files so you don't have local conflicting files. Yarn's lock file, or
[Relay](https://relay.dev)'s `__generated__` artifacts is notorious for this.
