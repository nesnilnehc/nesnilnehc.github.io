---
layout: default
title: 搜索
permalink: /search/
nav_order: 5
---

<div class="main-content">
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
        分类
      </label>
      <label>
        <input type="checkbox" id="exact-match">
        精确匹配
      </label>
    </div>
    <input type="text" id="search-input" placeholder="输入搜索关键词..." aria-label="搜索">
  </div>

  <div id="search-results" class="search-results">
    <p class="search-tip">输入关键词开始搜索...</p>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const titleSearch = document.getElementById('title-search');
  const contentSearch = document.getElementById('content-search');
  const categorySearch = document.getElementById('category-search');
  const exactMatch = document.getElementById('exact-match');
  
  const posts = [
    {% for post in site.posts %}
      {
        title: {{ post.title | jsonify }},
        url: {{ post.url | relative_url | jsonify }},
        date: {{ post.date | date: "%Y-%m-%d" | jsonify }},
        category: {{ post.categories | first | jsonify }},
        content: {{ post.content | strip_html | jsonify }},
        excerpt: {{ post.excerpt | strip_html | truncate: 200 | jsonify }}
      }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ];

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightText(text, query, isExact) {
    if (!query) return text;
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(isExact ? `\\b${escapedQuery}\\b` : escapedQuery, 'gi');
    return text.replace(regex, match => `<mark>${match}</mark>`);
  }

  function performSearch() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      searchResults.innerHTML = '<p class="search-tip">请输入至少2个字符...</p>';
      return;
    }

    const isExact = exactMatch.checked;
    const searchFields = {
      title: titleSearch.checked,
      content: contentSearch.checked,
      category: categorySearch.checked
    };

    if (!searchFields.title && !searchFields.content && !searchFields.category) {
      searchResults.innerHTML = '<p class="search-tip">请至少选择一个搜索范围</p>';
      return;
    }

    const results = posts.filter(post => {
      const escapedQuery = escapeRegExp(query);
      const regex = new RegExp(isExact ? `\\b${escapedQuery}\\b` : escapedQuery, 'i');
      
      const titleMatch = searchFields.title && regex.test(post.title);
      const contentMatch = searchFields.content && regex.test(post.content);
      const categoryMatch = searchFields.category && regex.test(post.category);
      
      if (contentMatch) {
        // 查找匹配位置的上下文
        const position = post.content.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, position - 50);
        const end = Math.min(post.content.length, position + query.length + 50);
        post.preview = post.content.slice(start, end);
        if (start > 0) post.preview = '...' + post.preview;
        if (end < post.content.length) post.preview += '...';
      }
      
      return titleMatch || contentMatch || categoryMatch;
    });

    if (results.length > 0) {
      const html = results.map(post => `
        <div class="search-result-item">
          <div class="search-result-header">
            <span class="search-result-date">${post.date}</span>
            <span class="search-result-category">${post.category}</span>
          </div>
          <h3 class="search-result-title">
            <a href="${post.url}">${highlightText(post.title, query, isExact)}</a>
          </h3>
          <div class="search-result-excerpt">
            ${highlightText(post.preview || post.excerpt, query, isExact)}
          </div>
        </div>
      `).join('');
      
      searchResults.innerHTML = `
        <div class="search-summary">找到 ${results.length} 篇相关文章</div>
        ${html}
      `;
    } else {
      searchResults.innerHTML = '<div class="no-results">未找到相关文章</div>';
    }
  }

  const debouncedSearch = debounce(performSearch, 300);
  
  // 监听搜索框输入
  searchInput.addEventListener('input', debouncedSearch);
  
  // 监听搜索选项变化
  titleSearch.addEventListener('change', debouncedSearch);
  contentSearch.addEventListener('change', debouncedSearch);
  categorySearch.addEventListener('change', debouncedSearch);
  exactMatch.addEventListener('change', debouncedSearch);
  
  // 自动聚焦到搜索框
  searchInput.focus();
  
  // 如果 URL 中有搜索参数，自动执行搜索
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get('q');
  if (queryParam) {
    searchInput.value = queryParam;
    performSearch();
  }
});
</script>
