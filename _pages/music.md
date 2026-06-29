---
layout: page
title: 喜欢的音乐
nav_title: 音乐
nav_order: 4
permalink: /music/
sidebar: false
---

这不是歌单平台，也不是乐评索引。这里只放一些我愿意反复听、并且想留在个人站里的音乐。

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

<section class="music-filter" aria-label="按艺人筛选音乐">
  <p class="music-filter__label">按艺人筛选</p>
  <div class="music-filter__controls">
    <button class="music-filter__button is-active" type="button" data-music-filter="all" aria-pressed="true">全部</button>
    {% for artist in music_artists %}
    <button class="music-filter__button" type="button" data-music-filter="{{ artist | escape }}" aria-pressed="false">{{ artist }}</button>
    {% endfor %}
  </div>
</section>

<section class="music-filter" aria-label="按标签筛选音乐">
  <p class="music-filter__label">按标签筛选</p>
  <div class="music-filter__controls" data-filter-group="music-tag">
    <button class="music-filter__button is-active" type="button" data-music-tag-filter="all" aria-pressed="true">全部</button>
    {% for tag in music_tags %}
    <button class="music-filter__button" type="button" data-music-tag-filter="{{ tag | escape }}" aria-pressed="false">{{ tag }}</button>
    {% endfor %}
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
