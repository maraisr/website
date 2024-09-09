---
title: Capture Errors in JavaScript
summary: Discover a more elegant approach to error handling in JavaScript, moving beyond the limitations of try/catch.
date: 2023-07-26
tags: [javascript]
---

If you've been working with JavaScript for a while, you've probably encountered the ubiquitous try/catch block for error
handling. While it gets the job done, it's not always the most elegant solution. Let me share a neat trick I've been
using that offers a more streamlined approach to capturing errors.

Consider this typical try/catch scenario:

```javascript
function doSomething() {
  try {
    // do something
  } catch (error) {
    console.error(error);
  }
}
```

While this works, it has some drawbacks:

1. The catch handler runs synchronously, potentially slowing down your critical path as it waits for error handling to
   complete before moving on.
2. It doesn't easily allow for more sophisticated error tracking, like sending errors to Sentry.

Here's an alternative that addresses these issues:

```typescript
function captureError<Value = unknown>(error: unknown, value?: Value) {
  if (__DEV__) {
    throw error;
  }
  setTimeout(() => {
    throw error;
  });
  return value;
}
```

This function can be used like so:

```javascript
function doSomething() {
  try {
    // do something
  } catch (error) {
    captureError(error);
  }
}
```

What makes this approach powerful is its flexibility. In development mode (`__DEV__`), it throws the error
synchronously, helping you catch issues early. In production, it throws the error asynchronously, triggering the global
error handler. This is where you can implement more advanced error tracking, like sending reports to Sentry.

Another cool feature is the ability to provide a fallback value. Here's an example:

```typescript
function onResponse(body: ResponseBody) {
  if (!body.success) return captureError(new Error(body.text), "didn't work mate");

  return 'worked mate';
}
```

By using this method, you can streamline your error handling, make your code more readable, and set up more
sophisticated error tracking with minimal effort. It's a small change that can make a big difference in your JavaScript
projects.
