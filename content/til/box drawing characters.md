---
title: Box drawing characters
summary: If you want to draw some boxes in your terminal, here's how you can do it.
date: 2023-07-31
tags: [terminal, ascii]
---

While working on adding a console reporter to [rian](https://github.com/maraisr/rian), I wanted to create box-like
structures around the traces.

Here's an example of what I was trying to achieve:

```shell
╭─ basic
│        ╭────────────────────────────────────────╮
│  95 ms │ ┣━━━━━━┫                               │◗ setup
│  43 ms │ ┣━━━┫                                  │◗ bootstrap
│  33 ms │ ┣━━┫                                   │◗ building
│  61 ms │       ┣━━━┫                            │◗ precompile
│  82 ms │        ┣━━━━━┫                         │◗ verify
│  68 ms │             ┣━━━━┫                     │◗ spawn thread
│ 370 ms │                 ┣╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍┫ │◗ doesnt finish
│ 344 ms │                 ┣━━━━━━━━━━━━━━━━━━━┫  │◗ running
│ 344 ms │                 ┣━━━━━━━━━━━━━━━━━━━┫  │◗ e2e
│  38 ms │                                  ┣━━┫  │◗ snapshot
│  14 ms │                                     ┣┫ │◗ url for page /my…
│        ╰┼┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┼┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┼╯
│         0 ms           320 ms             640 ms
╰─
```

To create these boxes, I needed to use specific ASCII codes. After some research, I found a useful resource:

👉 [this website](https://jrgraphix.net/r/Unicode/2500-257F)

It provides a comprehensive list of the necessary codes for box drawing, as well as other potentially useful characters
like arrows.

Here's a simple template to get started:

```shell
╭───────╮
│  BOX  │
╰───────╯
```
