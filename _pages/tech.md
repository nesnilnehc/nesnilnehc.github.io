---
layout: page
title: Tech
nav_title: Tech
nav_order: 2
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
