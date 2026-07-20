---
layout: default
title: 搜索
permalink: /search/
nav_order: 5
sidebar: false
---

<main class="search-page">
  <header class="search-page__intro">
    <p class="search-page__kicker">全站索引</p>
    <h1>搜索</h1>
    <p>在文章与个人收藏之间查找内容，包括影视、书籍、音乐和诗文。</p>
  </header>

  <div class="search-form" role="search">
    <label class="search-form__label" for="search-input">关键词</label>
    <div class="search-form__field">
      <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 4.5 4.5"></path></svg>
      <input type="search" id="search-input" name="q" placeholder="题名、作者、正文、标签……" aria-label="搜索全站内容" autocomplete="off" autofocus>
      <button id="search-clear" type="button" hidden>清除</button>
    </div>

    <div class="search-scopes" aria-label="内容类型">
      <button class="search-scope is-active" type="button" data-search-kind="all" aria-pressed="true">全部</button>
      <button class="search-scope" type="button" data-search-kind="article" aria-pressed="false">文章</button>
      <button class="search-scope" type="button" data-search-kind="movie" aria-pressed="false">影视</button>
      <button class="search-scope" type="button" data-search-kind="book" aria-pressed="false">书籍</button>
      <button class="search-scope" type="button" data-search-kind="music" aria-pressed="false">音乐</button>
      <button class="search-scope" type="button" data-search-kind="literature" aria-pressed="false">诗文</button>
    </div>
  </div>

  <div id="search-results" class="search-results" aria-live="polite" aria-atomic="false">
    <p class="search-tip">输入至少两个字符开始搜索。</p>
  </div>
</main>

{%- include search-data.html -%}
<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>
