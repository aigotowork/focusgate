---
layout: page
title: FocusGate Blog
permalink: /blog/en/
---

{% assign en_posts = site.posts | where: "lang", "en" %}
{% assign featured = en_posts | first %}

<section class="blog-hero">
  <div>
    <p class="blog-kicker">FocusGate Blog</p>
    <h1>Readable stories for healthier attention boundaries.</h1>
    <p>
      Articles about sleep boundaries, work focus, digital resets, and local-first privacy. Each post starts from a real user moment, explains the pain clearly, and ends with practical ways to configure FocusGate.
    </p>
  </div>
  <nav class="blog-hero-links" aria-label="Blog links">
    <a href="{{ "/blog/" | relative_url }}">中文文章</a>
    <a href="{{ "/blog/roadmap/" | relative_url }}">Roadmap</a>
  </nav>
</section>

{% if featured %}
<section class="blog-featured" aria-label="Featured article">
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

<section class="blog-grid" aria-label="English posts">
  {% for post in en_posts %}
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
