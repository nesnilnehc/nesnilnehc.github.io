---
layout: page
title: 喜欢的音乐
nav_title: 音乐
nav_order: 4
permalink: /music/
sidebar: false
---

<section class="music-profile" aria-label="音乐风格与听感">
  <p>我偏爱那些能承载辽阔、夜晚、告别、时间、季节转换、长大和挽留的歌。它们可以明亮直接，也可以克制清冷；重要的是能让我慢下来、重新提气，或把一段情绪放回生活里。</p>
</section>

{% assign music_artists = "" | split: "" %}
{% for track in site.data.music %}
  {% for artist in track.artists %}
    {% assign music_artists = music_artists | push: artist %}
  {% endfor %}
{% endfor %}
{% assign music_artists = music_artists | uniq | sort %}
{% assign music_languages = "" | split: "" %}
{% for track in site.data.music %}
  {% for language in track.languages %}
    {% assign music_languages = music_languages | push: language %}
  {% endfor %}
{% endfor %}
{% assign music_languages = music_languages | uniq | sort %}
{% assign music_primary_genres = "" | split: "" %}
{% for track in site.data.music %}
  {% assign music_primary_genres = music_primary_genres | push: track.primary_genre %}
{% endfor %}
{% assign music_primary_genres = music_primary_genres | uniq | sort %}
{% assign music_genres = "" | split: "" %}
{% for track in site.data.music %}
  {% for genre in track.genres %}
    {% assign music_genres = music_genres | push: genre %}
  {% endfor %}
{% endfor %}
{% assign music_genres = music_genres | uniq | sort %}
{% assign music_tags = "" | split: "" %}
{% for track in site.data.music %}
  {% for tag in track.tags %}
    {% assign music_tags = music_tags | push: tag %}
  {% endfor %}
{% endfor %}
{% assign music_tags = music_tags | uniq | sort %}
{% assign tracks_by_release = site.data.music | sort: "date" | reverse %}

<section class="collection-summary" aria-label="音乐收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.music | size }}</span>
    <span class="collection-summary__label">首音乐</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ music_artists | size }}</span>
    <span class="collection-summary__label">个表演</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ music_languages | size }}</span>
    <span class="collection-summary__label">种语种</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ music_primary_genres | size }}</span>
    <span class="collection-summary__label">类主曲风</span>
  </div>
</section>

<section class="collection-filters" aria-label="筛选音乐">
  <div class="music-filter">
    <p class="music-filter__label">排序</p>
    <div class="music-filter__controls">
      <button class="music-filter__button is-active" type="button" data-music-sort="date" aria-pressed="true">时间</button>
      <button class="music-filter__button" type="button" data-music-sort="count" aria-pressed="false">喜欢次数</button>
    </div>
  </div>
  <div class="music-filter">
    <p class="music-filter__label">表演</p>
    <div class="music-filter__controls">
      <button class="music-filter__button is-active" type="button" data-music-filter="all" aria-pressed="true">全部</button>
      {% for artist in music_artists %}
      <button class="music-filter__button" type="button" data-music-filter="{{ artist | escape }}" aria-pressed="false">{% include person-name.html name=artist %}</button>
      {% endfor %}
    </div>
  </div>
  <div class="music-filter">
    <p class="music-filter__label">语种</p>
    <div class="music-filter__controls" data-filter-group="music-language">
      <button class="music-filter__button is-active" type="button" data-music-language-filter="all" aria-pressed="true">全部</button>
      {% for language in music_languages %}
      <button class="music-filter__button" type="button" data-music-language-filter="{{ language | escape }}" aria-pressed="false">{% include music-taxonomy-label.html group="languages" value=language %}</button>
      {% endfor %}
    </div>
  </div>
  <div class="music-filter">
    <p class="music-filter__label">主曲风</p>
    <div class="music-filter__controls" data-filter-group="music-genre">
      <button class="music-filter__button is-active" type="button" data-music-genre-filter="all" aria-pressed="true">全部</button>
      {% for genre in music_primary_genres %}
      <button class="music-filter__button" type="button" data-music-genre-filter="{{ genre | escape }}" aria-pressed="false">{% include music-taxonomy-label.html group="genres" value=genre %}</button>
      {% endfor %}
    </div>
  </div>
  {% if music_tags.size > 0 %}
  <div class="music-filter">
    <p class="music-filter__label">标签</p>
    <div class="music-filter__controls" data-filter-group="music-tag">
      <button class="music-filter__button is-active" type="button" data-music-tag-filter="all" aria-pressed="true">全部</button>
      {% for tag in music_tags %}
      <button class="music-filter__button" type="button" data-music-tag-filter="{{ tag | escape }}" aria-pressed="false">{% include music-taxonomy-label.html group="tags" value=tag %}</button>
      {% endfor %}
    </div>
  </div>
  {% endif %}
</section>

<section class="music-shelf" aria-label="喜欢的音乐">
  {% for track in tracks_by_release %}
  <article class="music-entry" data-music-artists="{{ track.artists | join: '|' | escape }}" data-music-languages="{{ track.languages | join: '|' | escape }}" data-music-genre="{{ track.primary_genre | escape }}" data-music-tags="{{ track.tags | join: '|' | escape }}" data-music-date="{{ track.date }}" data-music-count="{{ track.count | default: 0 }}" data-music-order="{{ forloop.index0 }}">
    <span class="music-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
    {% if track.count %}
    <span class="music-entry__count" aria-label="喜欢 {{ track.count }} 次">喜欢 {{ track.count }} 次</span>
    {% endif %}
    <div class="music-entry__title-group">
      <h2>{{ track.original_title }}{% if track.title and track.title != track.original_title %}（{{ track.title }}）{% endif %}</h2>
      {% assign track_chip_count = track.languages.size | plus: 1 | plus: track.genres.size | plus: track.tags.size %}
      {% if track_chip_count > 0 %}
      <ul class="music-entry__tags" aria-label="分类标签">
        {% for language in track.languages %}
        <li>{% include music-taxonomy-label.html group="languages" value=language %}</li>
        {% endfor %}
        <li>{% include music-taxonomy-label.html group="genres" value=track.primary_genre %}</li>
        {% for genre in track.genres %}
        <li>{% include music-taxonomy-label.html group="genre_styles" value=genre %}</li>
        {% endfor %}
        {% for tag in track.tags %}
        <li>{% include music-taxonomy-label.html group="tags" value=tag %}</li>
        {% endfor %}
      </ul>
      {% endif %}
    </div>
    <dl class="music-entry__meta">
      <div>
        <dt>表演</dt>
        <dd>{% include person-name-list.html items=track.artists %}</dd>
      </div>
      {% if track.lyricists %}
      <div>
        <dt>作词</dt>
        <dd>{% include person-name-list.html items=track.lyricists %}</dd>
      </div>
      {% endif %}
      {% if track.composers %}
      <div>
        <dt>作曲</dt>
        <dd>{% include person-name-list.html items=track.composers %}</dd>
      </div>
      {% endif %}
      <div>
        <dt>发行</dt>
        <dd><time datetime="{{ track.date }}">{{ track.date }}</time>{% if track.date_label %}<span>{{ track.date_label }}</span>{% endif %}<span>{{ track.release_title }}{% if track.release_context %} · {{ track.release_context }}{% endif %}</span></dd>
      </div>
      {% if track.listen_links %}
      <div>
        <dt>收听</dt>
        <dd class="music-entry__links">{% for link in track.listen_links %}<a href="{{ link.url }}" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>{% unless forloop.last %}<span class="music-entry__separator">/</span>{% endunless %}{% endfor %}</dd>
      </div>
      {% endif %}
    </dl>
    {% assign track_note = track.note | strip %}
    {% if track_note != "" %}
    <p class="music-entry__note">{{ track_note }}</p>
    {% endif %}
  </article>
  {% endfor %}
</section>
