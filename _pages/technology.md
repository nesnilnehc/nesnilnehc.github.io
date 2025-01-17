---
layout: page
title: 技术分享
nav_title: 技术
nav_order: 2
permalink: /technology/
---

{% for post in site.categories.Technology %}
  <article class="post-entry">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="post-meta">{{ post.date | date: "%Y年%-m月%-d日" }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}
