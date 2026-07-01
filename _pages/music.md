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
    <span class="collection-summary__label">位艺人</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ music_tags | size }}</span>
    <span class="collection-summary__label">个标签</span>
  </div>
</section>

<section class="collection-filters" aria-label="筛选音乐">
  <div class="music-filter">
    <p class="music-filter__label">艺人</p>
    <div class="music-filter__controls">
      <button class="music-filter__button is-active" type="button" data-music-filter="all" aria-pressed="true">全部</button>
      {% for artist in music_artists %}
      <button class="music-filter__button" type="button" data-music-filter="{{ artist | escape }}" aria-pressed="false">{{ artist }}</button>
      {% endfor %}
    </div>
  </div>
  <div class="music-filter">
    <p class="music-filter__label">标签</p>
    <div class="music-filter__controls" data-filter-group="music-tag">
      <button class="music-filter__button is-active" type="button" data-music-tag-filter="all" aria-pressed="true">全部</button>
      {% for tag in music_tags %}
      <button class="music-filter__button" type="button" data-music-tag-filter="{{ tag | escape }}" aria-pressed="false">{{ tag }}</button>
      {% endfor %}
    </div>
  </div>
</section>

<section class="music-shelf" aria-label="喜欢的音乐">
  {% for track in tracks_by_release %}
  <article class="music-entry" data-music-artists="{{ track.artists | join: '|' | escape }}" data-music-tags="{{ track.tags | join: '|' | escape }}">
    <span class="music-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
    {% if track.count %}
    <span class="music-entry__count" aria-label="喜欢 {{ track.count }} 次">喜欢 {{ track.count }} 次</span>
    {% endif %}
    <div class="music-entry__title-group">
      <h2>{{ track.original_title }}{% if track.title and track.title != track.original_title %}（{{ track.title }}）{% endif %}</h2>
      {% if track.tags %}
      <ul class="music-entry__tags" aria-label="分类标签">
        {% for tag in track.tags %}
        <li>{{ tag }}</li>
        {% endfor %}
      </ul>
      {% endif %}
    </div>
    <dl class="music-entry__meta">
      <div>
        <dt>艺人</dt>
        <dd>{{ track.artist }}</dd>
      </div>
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
    <p class="music-entry__note">{{ track.note }}</p>
  </article>
  {% endfor %}
</section>
