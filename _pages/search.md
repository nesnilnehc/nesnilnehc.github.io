---
layout: default
title: 搜索
permalink: /search/
nav_order: 5
sidebar: false
---

<div class="search-page">
  <div class="search-form">
    <div class="search-options">
      <label>
        <input type="checkbox" id="title-search" checked>
        标题
      </label>
      <label>
        <input type="checkbox" id="content-search" checked>
        内容
      </label>
      <label>
        <input type="checkbox" id="category-search" checked>
        分类与标签
      </label>
      <label>
        <input type="checkbox" id="exact-match">
        精确匹配
      </label>
    </div>
    <input type="text" id="search-input" placeholder="请输入搜索关键词..." aria-label="搜索">
  </div>

  <div id="search-results" class="search-results">
    <p class="search-tip">请输入关键词开始搜索...</p>
  </div>
</div>

{%- include search-data.html -%}
<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>
