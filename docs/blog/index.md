---
layout: page
title: 守界 Blog
permalink: /blog/
---

{% assign zh_posts = site.posts | where: "lang", "zh-CN" %}
{% assign featured = zh_posts | first %}

<section class="blog-hero">
  <div>
    <p class="blog-kicker">FocusGate / 守界 Blog</p>
    <h1>把注意力边界，写成更容易读懂的生活场景。</h1>
    <p>
      这里记录睡眠边界、工作专注、数字戒断和本地优先隐私设计。每篇文章都从一个真实时刻开始：先说清痛点，再给出可以马上尝试的配置方法。
    </p>
  </div>
  <nav class="blog-hero-links" aria-label="Blog links">
    <a href="{{ "/blog/en/" | relative_url }}">English</a>
    <a href="{{ "/blog/roadmap/" | relative_url }}">内容规划</a>
  </nav>
</section>

{% if featured %}
<section class="blog-featured" aria-label="推荐文章">
  <a class="blog-featured-card" href="{{ featured.url | relative_url }}">
    <img src="{{ featured.image | relative_url }}" alt="" loading="lazy" />
    <span class="blog-card-body">
      <span class="blog-meta">
        <span>{{ featured.topic }}</span>
        <span>{{ featured.reading_time }}</span>
      </span>
      <strong>{{ featured.title }}</strong>
      <span>{{ featured.description }}</span>
    </span>
  </a>
</section>
{% endif %}

<section class="blog-grid" aria-label="中文文章">
  {% for post in zh_posts %}
  {% unless post.url == featured.url %}
  <article class="blog-card">
    <a href="{{ post.url | relative_url }}">
      <img src="{{ post.image | relative_url }}" alt="" loading="lazy" />
      <span class="blog-card-body">
        <span class="blog-meta">
          <span>{{ post.topic }}</span>
          <span>{{ post.reading_time }}</span>
        </span>
        <strong>{{ post.title }}</strong>
        <span>{{ post.description }}</span>
      </span>
    </a>
  </article>
  {% endunless %}
  {% endfor %}
</section>
