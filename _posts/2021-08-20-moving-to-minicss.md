---
layout: post
title: "Moving to Mini.css"
date: "2021-08-20 17:40:18 -0700"
tags:
  - css
  - website
  - mini.css
---

I've decided to overhaul this website with an improved visual design and more
responsive layout. To that end, I've added a CSS framework: [mini.css](https://minicss.org/).

This framework includes CSS normalization, something that I completely overlooked
when I created this site. The framework also comes with a simple, but powerful
grid system allowing for responsive websites. I hadn't previously considered
mobile devices when creating the layout of this site, but now the site should
work okay on a wider range of screen-sizes.

I'm not incredibly happy with the way the framework handles the header navigation
on mobile: if there's overflow, it simply creates a horizontal scrollbar.
I'd prefer a hamburger menu of some kind, and I'll probably look to implement
that at some point in the future.

What I do like is that the framework uses the system font stack, so the site
should appear in your operating system's default font, which is pretty cool.
