---
layout: page
title: 教程指南
nav_title: 教程
nav_order: 3
permalink: /tutorials/
---

{% for post in site.categories.tutorials %}
  <article class="post-entry">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="post-meta">{{ post.date | date: "%Y年%-m月%-d日" }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}
