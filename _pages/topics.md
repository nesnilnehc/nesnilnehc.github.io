---
layout: page
title: 主题
nav_title: 主题
permalink: /topics/
sidebar: false
---

<p class="page-intro">按问题域浏览内容。主题可以跨越技术文章、教程和定期观察。</p>

<div class="topic-index">
  {% for topic in site.data.topics %}
    <section class="topic-section" id="{{ topic.id }}">
      <header>
        <p class="section-kicker">主题 {{ forloop.index | prepend: "0" }}</p>
        <h2>{{ topic.name }}</h2>
        <p>{{ topic.description }}</p>
      </header>
      <div class="topic-posts">
        {% assign topic_count = 0 %}
        {% for post in site.posts %}
          {% assign matched = false %}
          {% for post_tag in post.tags %}
            {% if topic.tags contains post_tag %}
              {% assign matched = true %}
              {% break %}
            {% endif %}
          {% endfor %}
          {% if matched %}
            {% assign topic_count = topic_count | plus: 1 %}
            <a href="{{ post.url | relative_url }}">
              <span>{{ post.title }}</span>
              <time>{{ post.date | date: "%Y-%m-%d" }}</time>
            </a>
          {% endif %}
        {% endfor %}
        {% if topic_count == 0 %}<p class="empty-state">相关文章正在整理中。</p>{% endif %}
      </div>
    </section>
  {% endfor %}
</div>
