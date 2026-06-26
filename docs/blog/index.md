---
layout: page
title: 守界 Blog
permalink: /blog/
---

这里记录关于睡眠边界、工作专注、数字戒断和本地优先隐私设计的文章。文章面向真实用户：先说清场景和痛点，再给出可以马上尝试的配置方法。

[English posts]({{ "/blog/en/" | relative_url }}) · [内容规划]({{ "/blog/roadmap/" | relative_url }})

## 中文文章

{% assign zh_posts = site.posts | where: "lang", "zh-CN" %}
{% for post in zh_posts %}
- [{{ post.title }}]({{ post.url | relative_url }})  
  {{ post.description }}
{% endfor %}
