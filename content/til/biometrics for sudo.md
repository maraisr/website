---
title: Biometrics for `sudo` on a Mac
summary: How to use Touch ID to authenticate `sudo` commands
date: 2024-05-18
tags: [mac]
---

Like most corporate laptops, my work machine is locked down with a password policy that requires me to change it every
few months. Although I rarely need `sudo` access, when I do, it's a pain to type in my password every time.

I recently discovered a neat trick that allows me to use Touch ID to authenticate `sudo` commands on my Mac. Here's how
you can set it up:

```sh
sudo cp /etc/pam.d/sudo_local.template /etc/pam.d/sudo_local
```

and ensure that the `auth` line is uncommented. If not, this also works:

```sh
sudo echo "auth sufficient pam_tid.so" > /etc/pam.d/sudo_local
```
