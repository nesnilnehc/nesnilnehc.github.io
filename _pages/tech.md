---
layout: page
title: Technology
nav_title: Technology
nav_order: 3
permalink: /tech/
---

{% for post in site.categories.Technology %}
  <article class="post-entry">
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="post-meta">{{ post.date | date: "%B %-d, %Y" }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}
