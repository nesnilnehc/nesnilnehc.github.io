---
layout: home
title: Home
nav_title: Home
nav_order: 2
---

# Welcome to My Blog

欢迎来到我的个人网站！这里记录着我在软件开发、技术创新和个人成长方面的所思所想。

## 最新文章

{% assign latest_posts = site.posts | slice: 0, 5 %}
{% for post in latest_posts %}
  <article class="post-entry">
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    <div class="post-meta">{{ post.date | date: "%B %-d, %Y" }} • {{ post.categories | join: ", " }}</div>
    {% if post.excerpt %}
      <div class="post-excerpt">{{ post.excerpt }}</div>
    {% endif %}
  </article>
{% endfor %}
