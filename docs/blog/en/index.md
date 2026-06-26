---
layout: page
title: FocusGate Blog
permalink: /blog/en/
---

Articles about sleep boundaries, work focus, digital resets, and local-first privacy. Each post starts from a real user moment, explains the pain clearly, and ends with practical ways to configure FocusGate.

[中文文章]({{ "/blog/" | relative_url }}) · [Content roadmap]({{ "/blog/roadmap/" | relative_url }})

## English Posts

{% assign en_posts = site.posts | where: "lang", "en" %}
{% for post in en_posts %}
- [{{ post.title }}]({{ post.url | relative_url }})  
  {{ post.description }}
{% endfor %}
