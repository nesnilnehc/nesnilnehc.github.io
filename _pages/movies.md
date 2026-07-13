---
layout: page
title: 喜欢的影视
nav_title: 影视
nav_order: 3
permalink: /movies/
sidebar: false
---

<section class="movie-profile" aria-label="影视取向">
  <p>我偏爱那些把选择、尊严、天赋、骗局、机会、困境、出走和日常连接拍得具体的影视作品。它们可以温柔，也可以锋利；重要的是让我重新看见一个人怎样在时代、关系和制度里保住自己的判断。</p>
</section>

{% assign movie_types = "" | split: "" %}
{% assign movie_tags = "" | split: "" %}
{% for movie in site.data.movies %}
  {% assign movie_types = movie_types | push: movie.type %}
  {% for tag in movie.tags %}
    {% assign movie_tags = movie_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign movie_types = movie_types | uniq | sort %}
{% assign movie_tags = movie_tags | uniq | sort %}
{% assign movie_directors = "" | split: "" %}
{% assign movie_cast_members = "" | split: "" %}
{% for movie in site.data.movies %}
  {% if movie.directors %}
    {% for director in movie.directors %}
      {% assign movie_directors = movie_directors | push: director %}
    {% endfor %}
  {% elsif movie.director %}
    {% assign movie_directors = movie_directors | push: movie.director %}
  {% endif %}
  {% for member in movie.cast %}
    {% assign movie_cast_members = movie_cast_members | push: member %}
  {% endfor %}
{% endfor %}
{% assign movie_directors = movie_directors | uniq | sort %}
{% assign movie_cast_members = movie_cast_members | uniq | sort %}
{% assign movies_by_premiere = site.data.movies | sort: "premiere_date" | reverse %}

<section class="collection-summary" aria-label="影视收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.movies | size }}</span>
    <span class="collection-summary__label">部作品</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ movie_types | size }}</span>
    <span class="collection-summary__label">种类型</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ movie_directors | size }}</span>
    <span class="collection-summary__label">位主创</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ movie_tags | size }}</span>
    <span class="collection-summary__label">个标签</span>
  </div>
</section>

<section class="collection-filters" aria-label="筛选影视">
  <div class="movie-filter">
    <p class="movie-filter__label">排序</p>
    <div class="movie-filter__controls">
      <button class="movie-filter__button is-active" type="button" data-movie-sort="date" aria-pressed="true">时间</button>
      <button class="movie-filter__button" type="button" data-movie-sort="count" aria-pressed="false">喜欢次数</button>
    </div>
  </div>
  <div class="movie-filter">
    <p class="movie-filter__label">类型</p>
    <div class="movie-filter__controls" data-filter-group="movie-type">
      <button class="movie-filter__button is-active" type="button" data-movie-type-filter="all" aria-pressed="true">全部</button>
      {% for type in movie_types %}
      <button class="movie-filter__button" type="button" data-movie-type-filter="{{ type | escape }}" aria-pressed="false">{{ site.data.movie_types[type] | default: type }}</button>
      {% endfor %}
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
    <p class="movie-filter__label">主创</p>
    <div class="movie-filter__controls" data-filter-group="movie-director">
      <button class="movie-filter__button is-active" type="button" data-movie-director-filter="all" aria-pressed="true">全部</button>
      {% for director in movie_directors %}
      <button class="movie-filter__button" type="button" data-movie-director-filter="{{ director | escape }}" aria-pressed="false">{% include person-name.html name=director %}</button>
      {% endfor %}
    </div>
  </div>
  <div class="movie-filter">
    <p class="movie-filter__label">主演</p>
    <div class="movie-filter__controls" data-filter-group="movie-cast">
      <button class="movie-filter__button is-active" type="button" data-movie-cast-filter="all" aria-pressed="true">全部</button>
      {% for member in movie_cast_members %}
      <button class="movie-filter__button" type="button" data-movie-cast-filter="{{ member | escape }}" aria-pressed="false">{% include person-name.html name=member %}</button>
      {% endfor %}
    </div>
  </div>
</section>

<section class="movie-shelf" aria-label="喜欢的影视">
  {% for movie in movies_by_premiere %}
  {% if movie.directors %}
    {% assign movie_credit_names = movie.directors %}
  {% elsif movie.director %}
    {% assign movie_credit_names = "" | split: "" | push: movie.director %}
  {% else %}
    {% assign movie_credit_names = "" | split: "" %}
  {% endif %}
  <article class="movie-entry" data-movie-type="{{ movie.type | default: 'film' | escape }}" data-movie-tags="{{ movie.tags | join: '|' | escape }}" data-movie-director="{{ movie_credit_names | join: '|' | escape }}" data-movie-cast="{{ movie.cast | join: '|' | escape }}" data-movie-date="{{ movie.premiere_date }}" data-movie-count="{{ movie.count | default: 0 }}" data-movie-order="{{ forloop.index0 }}">
    <div class="movie-entry__media">
      {% assign poster_src = movie.poster_url | default: movie.poster %}
      {% if poster_src %}
      <figure class="movie-entry__poster{% if movie.poster_fit == 'contain' %} movie-entry__poster--contain{% endif %}">
        <img src="{% if movie.poster_url %}{{ poster_src }}{% else %}{{ poster_src | relative_url }}{% endif %}" alt="{{ movie.chinese_title | default: movie.original_title }} 海报" loading="lazy" decoding="async">
      </figure>
      {% endif %}
      <span class="movie-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
      {% if movie.count %}
      <span class="movie-entry__count" aria-label="喜欢 {{ movie.count }} 次">喜欢 {{ movie.count }} 次</span>
      {% endif %}
    </div>
    <div class="movie-entry__title-group">
      <h2>
        {{ movie.original_title }}{% if movie.chinese_title and movie.chinese_title != movie.original_title %}（{{ movie.chinese_title }}）{% endif %}
      </h2>
      {% assign movie_type_label = site.data.movie_types[movie.type] | default: movie.type %}
      {% if movie_type_label or movie.tags %}
      <ul class="movie-entry__tags" aria-label="分类标签">
        {% if movie_type_label %}
        <li>{{ movie_type_label }}</li>
        {% endif %}
        {% for tag in movie.tags %}
        {% unless tag == movie_type_label %}
        <li>{{ tag }}</li>
        {% endunless %}
        {% endfor %}
      </ul>
      {% endif %}
    </div>
    <dl class="movie-entry__meta">
      <div>
        <dt>主创</dt>
        <dd class="movie-entry__credits">{% include person-name-list.html items=movie_credit_names %}</dd>
      </div>
      {% assign movie_cast_count = movie.cast | size %}
      {% if movie_cast_count > 0 %}
      <div>
        <dt>主演</dt>
        <dd class="movie-entry__credits">{% include person-name-list.html items=movie.cast %}</dd>
      </div>
      {% endif %}
      <div>
        <dt>播映</dt>
        <dd class="movie-entry__premiere">{% include movie-premiere.html date=movie.premiere_date note=movie.premiere_note type=movie.type %}</dd>
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
    {% assign movie_note = movie.note | strip %}
    {% if movie_note != "" %}
    <p class="movie-entry__note">{{ movie_note }}</p>
    {% endif %}
  </article>
  {% endfor %}
</section>
