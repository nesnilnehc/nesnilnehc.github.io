---
layout: page
title: 喜欢的电影
nav_title: 电影
nav_order: 3
permalink: /movies/
sidebar: false
---

<section class="movie-profile" aria-label="电影取向">
  <p>我偏爱那些把选择、尊严、天赋、骗局、机会、困境、出走和日常连接拍得具体的电影。它们可以温柔，也可以锋利；重要的是让我重新看见一个人怎样在时代、关系和制度里保住自己的判断。</p>
</section>

{% assign movie_tags = "" | split: "" %}
{% for movie in site.data.movies %}
  {% for tag in movie.tags %}
    {% assign movie_tags = movie_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign movie_tags = movie_tags | uniq | sort %}
{% assign movie_directors = "" | split: "" %}
{% for movie in site.data.movies %}
  {% assign movie_directors = movie_directors | push: movie.director %}
{% endfor %}
{% assign movie_directors = movie_directors | uniq | sort %}
{% assign movies_by_premiere = site.data.movies | sort: "premiere_date" | reverse %}

<section class="collection-summary" aria-label="电影收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.movies | size }}</span>
    <span class="collection-summary__label">部电影</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ movie_directors | size }}</span>
    <span class="collection-summary__label">位导演</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ movie_tags | size }}</span>
    <span class="collection-summary__label">个标签</span>
  </div>
</section>

<section class="collection-filters" aria-label="筛选电影">
  <div class="movie-filter">
    <p class="movie-filter__label">排序</p>
    <div class="movie-filter__controls">
      <button class="movie-filter__button is-active" type="button" data-movie-sort="date" aria-pressed="true">时间</button>
      <button class="movie-filter__button" type="button" data-movie-sort="count" aria-pressed="false">喜欢次数</button>
    </div>
  </div>
  <div class="movie-filter">
    <p class="movie-filter__label">标签</p>
    <div class="movie-filter__controls">
      <button class="movie-filter__button is-active" type="button" data-movie-filter="all" aria-pressed="true">全部</button>
      {% for tag in movie_tags %}
      <button class="movie-filter__button" type="button" data-movie-filter="{{ tag | escape }}" aria-pressed="false">{{ tag }}</button>
      {% endfor %}
    </div>
  </div>
  <div class="movie-filter">
    <p class="movie-filter__label">导演</p>
    <div class="movie-filter__controls" data-filter-group="movie-director">
      <button class="movie-filter__button is-active" type="button" data-movie-director-filter="all" aria-pressed="true">全部</button>
      {% for director in movie_directors %}
      <button class="movie-filter__button" type="button" data-movie-director-filter="{{ director | escape }}" aria-pressed="false">{{ director }}</button>
      {% endfor %}
    </div>
  </div>
</section>

<section class="movie-shelf" aria-label="喜欢的电影">
  {% for movie in movies_by_premiere %}
  <article class="movie-entry" data-movie-tags="{{ movie.tags | join: '|' | escape }}" data-movie-director="{{ movie.director | escape }}" data-movie-date="{{ movie.premiere_date }}" data-movie-count="{{ movie.count | default: 0 }}" data-movie-order="{{ forloop.index0 }}">
    <span class="movie-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
    {% if movie.count %}
    <span class="movie-entry__count" aria-label="喜欢 {{ movie.count }} 次">喜欢 {{ movie.count }} 次</span>
    {% endif %}
    <div class="movie-entry__title-group">
      <h2>
        {{ movie.original_title }}{% if movie.chinese_title and movie.chinese_title != movie.original_title %}（{{ movie.chinese_title }}）{% endif %}
      </h2>
      {% if movie.tags %}
      <ul class="movie-entry__tags" aria-label="分类标签">
        {% for tag in movie.tags %}
        <li>{{ tag }}</li>
        {% endfor %}
      </ul>
      {% endif %}
    </div>
    <dl class="movie-entry__meta">
      <div>
        <dt>导演</dt>
        <dd>{{ movie.director }}</dd>
      </div>
      <div>
        <dt>首映</dt>
        <dd><time datetime="{{ movie.premiere_date }}">{{ movie.premiere_date }}</time>{% if movie.premiere_note %}<span>{{ movie.premiere_note }}</span>{% endif %}</dd>
      </div>
      <div>
        <dt>获奖</dt>
        <dd>{{ movie.awards }}</dd>
      </div>
      <div>
        <dt>资料</dt>
        <dd><a href="{{ movie.imdb_url }}" target="_blank" rel="noopener noreferrer">IMDb</a></dd>
      </div>
    </dl>
    {% if movie.note %}
    <p class="movie-entry__note">{{ movie.note }}</p>
    {% endif %}
  </article>
  {% endfor %}
</section>
