---
title: Footnotes
summary: Markdown footnotes guide.
date: 2024-11-04
tags: [markdown]
---

I frequently use footnotes but don't write documents often enough to remember how I like to use them. I know the syntax
involves `[^X]`, but I'm unsure whether to place the footnote after the paragraph where it's used or at the end of the
document. What about numbering?

The way I use them is nice because it means I can reuse a footnote in multiple places. I can also refactor my footnotes
without having to reorder the numbers.

1. Use the word as the key. For example, if I wanted to footnote the word "foobar", I would use `[^foobar]`.
2. Place the footnote at the end of the document. I typically include a `<!-- footnotes -->` comment to indicate where
   the footnotes should go.
3. That's it!

Here's an example:

```markdown
This is a paragraph with a footnote[^footnote]. And another[^another] one

<!-- footnotes -->

[^footnote]: This is the footnote text.

[^another]: Another footnote, you're welcome.
```
