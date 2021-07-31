---
category: programming
tags:
  - jekyll
  - html
  - css
  - website
title: Next and Previous Page Links
---

I have added a new feature to this site. At the bottom of each blog post and project, there are now links that lead to the next and previous page.  

This is one of the features that really make static site generators like Jekyll really shine as compared to making every page by hand. The `page.next` and `page.previous` variables will always point to the next and previous page respectively (if they exist), and I can reference them in the post layout to create links that always point to the next and previous page, regardless of where they are.

This feature didn't really need a blog post to explain it, but the site *does* need to have more than one post for this feature to work. That's the real reason I wrote this post.