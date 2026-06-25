---
layout: page
title: 归档
nav_title: 归档
permalink: /archive/
sidebar: false
---

<p class="page-intro">按发布时间查看全部 {{ site.posts.size }} 篇文章。</p>

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
<div class="archive-index">
  {% for year in posts_by_year %}
    <section>
      <h2>{{ year.name }} <span>{{ year.items.size }}</span></h2>
      {% include post-list.html posts=year.items %}
    </section>
  {% endfor %}
</div>
