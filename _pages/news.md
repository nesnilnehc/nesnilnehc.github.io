---
layout: page
title: 新闻动态
nav_title: 新闻
nav_order: 2
permalink: /news/
---

{% for post in site.categories.News %}
  <article class="post-entry">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="post-meta">{{ post.date | date: "%Y年%-m月%-d日" }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}
