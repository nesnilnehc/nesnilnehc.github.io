---
layout: page
title: 喜欢的书籍
nav_title: 书籍
nav_order: 4
permalink: /books/
sidebar: false
---

<section class="book-profile" aria-label="阅读取向">
  <p>我偏爱那些能解释行动、选择、组织、技术和生活秩序的书。它们不必给出万能答案，但要能留下可复用的判断框架，让我在现实问题里少一点惯性，多一点清醒。</p>
</section>

{% assign book_authors = "" | split: "" %}
{% assign book_categories = "" | split: "" %}
{% assign book_tags = "" | split: "" %}
{% for book in site.data.books %}
  {% for author in book.authors %}
    {% assign book_authors = book_authors | push: author %}
  {% endfor %}
  {% assign book_categories = book_categories | push: book.category %}
  {% for tag in book.tags %}
    {% assign book_tags = book_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign book_authors = book_authors | uniq | sort %}
{% assign book_categories = book_categories | uniq | sort %}
{% assign book_tags = book_tags | uniq | sort %}
{% assign books_by_publish = site.data.books | sort: "original_publish_date" | reverse %}

<section class="collection-summary" aria-label="书籍收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.books | size }}</span>
    <span class="collection-summary__label">本书籍</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ book_authors | size }}</span>
    <span class="collection-summary__label">位作者</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ book_categories | size }}</span>
    <span class="collection-summary__label">种类别</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ book_tags | size }}</span>
    <span class="collection-summary__label">个标签</span>
  </div>
</section>

<section class="collection-filters" aria-label="筛选书籍">
  <div class="book-filter">
    <p class="book-filter__label">排序</p>
    <div class="book-filter__controls">
      <button class="book-filter__button is-active" type="button" data-book-sort="date" aria-pressed="true">时间</button>
      <button class="book-filter__button" type="button" data-book-sort="count" aria-pressed="false">喜欢次数</button>
    </div>
  </div>
  <div class="book-filter">
    <p class="book-filter__label">作者</p>
    <div class="book-filter__controls" data-filter-group="book-author">
      <button class="book-filter__button is-active" type="button" data-book-author-filter="all" aria-pressed="true">全部</button>
      {% for author in book_authors %}
      <button class="book-filter__button" type="button" data-book-author-filter="{{ author | escape }}" aria-pressed="false">{% include person-name.html name=author %}</button>
      {% endfor %}
    </div>
  </div>
  <div class="book-filter">
    <p class="book-filter__label">类别</p>
    <div class="book-filter__controls" data-filter-group="book-category">
      <button class="book-filter__button is-active" type="button" data-book-category-filter="all" aria-pressed="true">全部</button>
      {% for category in book_categories %}
      <button class="book-filter__button" type="button" data-book-category-filter="{{ category | escape }}" aria-pressed="false">{{ category }}</button>
      {% endfor %}
    </div>
  </div>
  <div class="book-filter">
    <p class="book-filter__label">标签</p>
    <div class="book-filter__controls" data-filter-group="book-tag">
      <button class="book-filter__button is-active" type="button" data-book-tag-filter="all" aria-pressed="true">全部</button>
      {% for tag in book_tags %}
      <button class="book-filter__button" type="button" data-book-tag-filter="{{ tag | escape }}" aria-pressed="false">{{ tag }}</button>
      {% endfor %}
    </div>
  </div>
</section>

<section class="book-shelf" aria-label="喜欢的书籍">
  {% for book in books_by_publish %}
  <article class="book-entry" data-book-authors="{{ book.authors | join: '|' | escape }}" data-book-category="{{ book.category | escape }}" data-book-tags="{{ book.tags | join: '|' | escape }}" data-book-date="{{ book.original_publish_date }}" data-book-count="{{ book.count | default: 0 }}" data-book-order="{{ forloop.index0 }}">
    <span class="book-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
    {% if book.count %}
    <span class="book-entry__count" aria-label="喜欢 {{ book.count }} 次">喜欢 {{ book.count }} 次</span>
    {% endif %}
    <div class="book-entry__title-group">
      <h2>{{ book.chinese_title | default: book.original_title }}{% if book.original_title and book.original_title != book.chinese_title %}（{{ book.original_title }}）{% endif %}</h2>
      <ul class="book-entry__tags" aria-label="分类标签">
        <li>{{ book.category }}</li>
        {% for tag in book.tags %}
        <li>{{ tag }}</li>
        {% endfor %}
      </ul>
    </div>
    <dl class="book-entry__meta">
      <div>
        <dt>作者</dt>
        <dd>{% include person-name-list.html items=book.authors %}</dd>
      </div>
      {% if book.translators %}
      <div>
        <dt>译者</dt>
        <dd>{% include person-name-list.html items=book.translators %}</dd>
      </div>
      {% endif %}
      <div>
        <dt>出版</dt>
        <dd class="book-entry__publish"><time datetime="{{ book.original_publish_date }}">{{ book.original_publish_date | slice: 0, 4 }}</time><span class="book-entry__separator">/</span><span>{{ book.publisher }}</span></dd>
      </div>
      {% if book.isbn %}
      <div>
        <dt>ISBN</dt>
        <dd>{{ book.isbn }}</dd>
      </div>
      {% endif %}
      {% if book.source_url %}
      <div>
        <dt>资料</dt>
        <dd><a href="{{ book.source_url }}" target="_blank" rel="noopener noreferrer">书目信息</a></dd>
      </div>
      {% endif %}
    </dl>
    {% assign book_note = book.note | strip %}
    {% if book_note != "" %}
    <p class="book-entry__note">{{ book_note }}</p>
    {% endif %}
  </article>
  {% endfor %}
</section>
