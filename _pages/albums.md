---
layout: page
title: 喜欢的音乐专辑
nav_title: 专辑
nav_order: 5
permalink: /albums/
sidebar: false
---

<section class="album-profile" aria-label="专辑收藏说明">
  <p>这里收录值得从头听到尾的完整专辑。单曲记录某一个瞬间，专辑则留下更完整的声音、顺序与时间。</p>
</section>

<nav class="music-collection-nav" aria-label="音乐收藏分类">
  <a href="{{ '/music/' | relative_url }}">单曲</a>
  <a class="is-active" href="{{ '/albums/' | relative_url }}" aria-current="page">专辑</a>
</nav>

{% assign album_artists = "" | split: "" %}
{% assign album_genres = "" | split: "" %}
{% for album in site.data.albums %}
  {% for artist in album.artists %}
    {% assign album_artists = album_artists | push: artist %}
  {% endfor %}
  {% assign album_genres = album_genres | push: album.genre %}
{% endfor %}
{% assign album_artists = album_artists | uniq | sort %}
{% assign album_genres = album_genres | uniq | sort %}
{% assign albums_by_release = site.data.albums | sort: "release_date" | reverse %}

<section class="collection-summary" aria-label="专辑收藏概览">
  <div>
    <span class="collection-summary__value">{{ site.data.albums | size }}</span>
    <span class="collection-summary__label">张专辑</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ album_artists | size }}</span>
    <span class="collection-summary__label">位歌手</span>
  </div>
  <div>
    <span class="collection-summary__value">{{ album_genres | size }}</span>
    <span class="collection-summary__label">种曲风</span>
  </div>
</section>

<section class="movie-shelf album-shelf" aria-label="喜欢的音乐专辑">
  {% for album in albums_by_release %}
  <article class="movie-entry album-entry" id="{{ album.id }}" data-movie-date="{{ album.release_date }}" data-movie-count="{{ album.count | default: 0 }}" data-movie-order="{{ forloop.index0 }}">
    <div class="movie-entry__media">
      <figure class="movie-entry__poster album-entry__cover">
        <img src="{{ album.artwork_url }}" alt="{{ album.title }} 专辑封面" loading="lazy" decoding="async">
      </figure>
      <span class="movie-entry__index">{{ forloop.index | prepend: "0" | slice: -2, 2 }}</span>
      {% if album.count %}
      <span class="movie-entry__count" aria-label="喜欢 {{ album.count }} 次">喜欢 {{ album.count }} 次</span>
      {% endif %}
    </div>
    <div class="movie-entry__title-group">
      <h2>{{ album.title }}{% if album.original_title and album.original_title != album.title %}（{{ album.original_title }}）{% endif %}</h2>
      <ul class="movie-entry__tags" aria-label="分类标签">
        <li>{{ album.release_type }}</li>
        <li>{{ album.genre }}</li>
        {% for language in album.languages %}
        <li>{% include music-taxonomy-label.html group="languages" value=language %}</li>
        {% endfor %}
      </ul>
    </div>
    <dl class="movie-entry__meta">
      <div>
        <dt>歌手</dt>
        <dd class="movie-entry__credits">{% include person-name-list.html items=album.artists %}</dd>
      </div>
      <div>
        <dt>发行</dt>
        <dd class="album-entry__release"><time datetime="{{ album.release_date }}">{{ album.release_date }}</time><span class="music-entry__separator">/</span><span>{{ album.label }}</span></dd>
      </div>
      <div>
        <dt>曲目</dt>
        <dd>{{ album.track_count }} 首<span>{{ album.duration }}</span></dd>
      </div>
      {% assign collected_album_tracks = site.data.music | where: "album_id", album.id %}
      {% if collected_album_tracks.size > 0 %}
      <div>
        <dt>单曲</dt>
        <dd class="album-entry__tracks">{% for track in collected_album_tracks %}{% assign track_path = "/music/#" | append: track.id %}<a href="{{ track_path | relative_url }}">《{% include music-title.html original_title=track.original_title title=track.title %}》</a>{% unless forloop.last %}<span class="music-entry__separator">/</span>{% endunless %}{% endfor %}</dd>
      </div>
      {% endif %}
      {% if album.listen_links %}
      <div>
        <dt>收听</dt>
        <dd class="music-entry__links">{% for link in album.listen_links %}{% include music-listen-link.html label=link.label url=link.url %}{% unless forloop.last %}<span class="music-entry__separator">/</span>{% endunless %}{% endfor %}</dd>
      </div>
      {% endif %}
    </dl>
    {% assign album_note = album.note | strip %}
    {% if album_note != "" %}
    <p class="movie-entry__note">{{ album_note }}</p>
    {% endif %}
  </article>
  {% endfor %}
</section>
