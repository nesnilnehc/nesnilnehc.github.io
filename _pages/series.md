---
layout: page
title: 系列
nav_title: 系列
permalink: /series/
sidebar: false
---

<p class="page-intro">系列将相关内容组织成连续阅读路径，并标明当前维护状态。</p>

<div class="series-index">
  {% for series in site.data.series %}
    {% assign series_posts = site.posts | where: "series", series.id | sort: "series_order" %}
    <section class="series-section" id="{{ series.id }}">
      <header>
        <div>
          <p class="section-kicker">{{ series.status | default: "active" }}</p>
          <h2>{{ series.name }}</h2>
          <p>{{ series.description }}</p>
        </div>
        {% capture subscribe_subject %}订阅系列：{{ series.name }}{% endcapture %}
        <a class="text-action" href="mailto:{{ site.data.site.email }}?subject={{ subscribe_subject | cgi_escape }}">订阅更新</a>
      </header>
      <ol class="series-posts">
        {% for post in series_posts %}
          <li>
            <span>{{ post.series_order | default: forloop.index }}</span>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            {% if post.modified_date %}<time>更新于 {{ post.modified_date | date: "%Y-%m-%d" }}</time>{% endif %}
          </li>
        {% endfor %}
      </ol>
    </section>
  {% endfor %}
</div>
