---
title: git subtree
date: 2022-08-03
tags: [git]
---

I was trying to consolidate my university repos [into one](https://github.com/maraisr/uni-days) and retain history.

Was actually quite easy:

```sh
git subtree -P <target dir> git@github.com/... <branch>
# eg git subtree add -P cab230/ git@github.com:maraisr/cab230 main
```

... and you can just keep running that for every directory/repo combo you want.

There was a gotcha where because it is a new repo, it had no commits. And there needs to be at least 1 commit;
`git cm -m "init" --allow-empty`
