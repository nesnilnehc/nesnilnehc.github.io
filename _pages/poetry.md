---
layout: page
title: 喜欢的诗文
nav_title: 诗文
nav_order: 6
permalink: /poetry/
sidebar: false
---

<section class="poetry-profile" aria-label="诗文取向">
  <p>收录偶然读到、愿意反复回看的诗、偈与短文。篇幅不必长，重要的是能在寥寥数语里，让人重新看见当下。非中文作品保留原文；有可靠中文译文时一并收录。</p>
</section>

{% assign poetry_authors = "" | split: "" %}
{% assign poetry_periods = "" | split: "" %}
{% assign poetry_types = "" | split: "" %}
{% for work in site.data.literature %}
  {% assign poetry_authors = poetry_authors | push: work.author %}
  {% assign poetry_periods = poetry_periods | push: work.period %}
  {% assign poetry_types = poetry_types | push: work.type %}
{% endfor %}
{% assign poetry_authors = poetry_authors | uniq | sort %}
{% assign poetry_periods = poetry_periods | uniq | sort %}
{% assign poetry_types = poetry_types | uniq | sort %}

<section class="collection-summary poetry-summary" aria-label="诗文收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.literature | size }}</span>
    <span class="collection-summary__label">篇作品</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ poetry_authors | size }}</span>
    <span class="collection-summary__label">位作者</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ poetry_periods | size }}</span>
    <span class="collection-summary__label">个时期</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ poetry_types | size }}</span>
    <span class="collection-summary__label">种体裁</span>
  </div>
</section>

<section class="poetry-tools" aria-label="查找诗文">
  <div class="poetry-filter">
    <p class="poetry-filter__label">时期</p>
    <div class="poetry-filter__controls">
      <button class="poetry-filter__button is-active" type="button" data-poetry-period-filter="all" aria-pressed="true">全部</button>
      {% for period in poetry_periods %}
      <button class="poetry-filter__button" type="button" data-poetry-period-filter="{{ period | escape }}" aria-pressed="false">{{ period }}</button>
      {% endfor %}
    </div>
  </div>
  <div class="poetry-filter">
    <p class="poetry-filter__label">体裁</p>
    <div class="poetry-filter__controls">
      <button class="poetry-filter__button is-active" type="button" data-poetry-type-filter="all" aria-pressed="true">全部</button>
      {% for type in poetry_types %}
      <button class="poetry-filter__button" type="button" data-poetry-type-filter="{{ type | escape }}" aria-pressed="false">{{ type }}</button>
      {% endfor %}
    </div>
  </div>
</section>

<div class="poetry-results" aria-live="polite">
  <span data-poetry-result-count>共 {{ site.data.literature | size }} 篇</span>
  <span>点击题名展开全文</span>
</div>

<section class="poetry-shelf" aria-label="喜欢的诗文">
  {% for work in site.data.literature %}
  <details class="poetry-entry" id="{{ work.id }}" data-poetry-period="{{ work.period | escape }}" data-poetry-type="{{ work.type | escape }}">
    <summary class="poetry-entry__summary">
      <span class="poetry-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
      <span class="poetry-entry__identity">
        <span class="poetry-entry__title">{{ work.title }}</span>
        <span class="poetry-entry__byline">{{ work.period }}{% if work.region != "" %}<span aria-hidden="true"> · </span>{{ work.region }}{% endif %}<span aria-hidden="true"> · </span>{% include person-name.html name=work.author %}</span>
      </span>
      <span class="poetry-entry__type">{{ work.type }}</span>
      <span class="poetry-entry__toggle" aria-hidden="true"></span>
    </summary>

    <div class="poetry-entry__body">
      <div class="poetry-entry__version">
        {% if work.language != "zh" %}<p class="poetry-entry__version-label">原文</p>{% endif %}
        <blockquote class="poetry-entry__text{% if work.form == 'prose' %} poetry-entry__text--prose{% endif %}">
        {% if work.form == "verse" %}
        <p>{% for line in work.content %}{{ line }}{% unless forloop.last %}<br>{% endunless %}{% endfor %}</p>
        {% else %}
        {% for paragraph in work.content %}<p>{{ paragraph }}</p>{% endfor %}
        {% endif %}
        </blockquote>
      </div>

      {% if work.translated_content and work.translated_content != empty %}
      <div class="poetry-entry__version poetry-entry__version--translation">
        <p class="poetry-entry__version-label">中文译文</p>
        <blockquote class="poetry-entry__text poetry-entry__text--translation{% if work.form == 'prose' %} poetry-entry__text--prose{% endif %}">
          {% if work.form == "verse" %}
          <p>{% for line in work.translated_content %}{{ line }}{% unless forloop.last %}<br>{% endunless %}{% endfor %}</p>
          {% else %}
          {% for paragraph in work.translated_content %}<p>{{ paragraph }}</p>{% endfor %}
          {% endif %}
        </blockquote>
      </div>
      {% endif %}

      <footer class="poetry-entry__source">
        <p>{{ work.note }}</p>
        <a href="{{ work.source_url }}" target="_blank" rel="noopener noreferrer">资料来源：{{ work.source_label }}<span aria-hidden="true"> ↗</span></a>
      </footer>
    </div>
  </details>
  {% endfor %}
  <p class="poetry-empty" data-poetry-empty hidden>没有找到符合条件的作品。</p>
</section>
