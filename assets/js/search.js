(function () {
  "use strict";

  const posts = window.siteSearchPosts || [];

  function debounce(fn, wait) {
    let timeout;
    return function () {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, query, exact) {
    const safeText = escapeHTML(text);
    if (!query) return safeText;
    const expression = exact ? "\\b" + escapeRegExp(query) + "\\b" : escapeRegExp(query);
    return safeText.replace(new RegExp(expression, "gi"), "<mark>$&</mark>");
  }

  function searchableTaxonomy(post) {
    return [post.category, post.series].concat(post.tags || []).join(" ");
  }

  function initQuickSearch() {
    const input = document.getElementById("quick-search-input");
    const container = document.getElementById("quick-search-results");
    if (!input || !container) return;

    const run = debounce(function () {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        container.hidden = true;
        return;
      }

      const results = posts.filter(function (post) {
        return post.title.toLowerCase().includes(query) ||
          searchableTaxonomy(post).toLowerCase().includes(query);
      }).slice(0, 5);

      container.innerHTML = results.length ? results.map(function (post) {
        return "<div class=\"quick-search-result-item\"><a href=\"" + escapeHTML(post.url) +
          "\"><span class=\"quick-search-result-date\">" + escapeHTML(post.date) +
          "</span><span class=\"quick-search-result-title\">" + escapeHTML(post.title) +
          "</span></a></div>";
      }).join("") : "<div class=\"no-results\">未找到相关文章</div>";
      container.hidden = false;
    }, 200);

    input.addEventListener("input", run);
    document.addEventListener("click", function (event) {
      if (!input.contains(event.target) && !container.contains(event.target)) {
        container.hidden = true;
      }
    });
  }

  function initFullSearch() {
    const input = document.getElementById("search-input");
    const container = document.getElementById("search-results");
    if (!input || !container) return;

    const titleOption = document.getElementById("title-search");
    const contentOption = document.getElementById("content-search");
    const taxonomyOption = document.getElementById("category-search");
    const exactOption = document.getElementById("exact-match");

    function run() {
      const query = input.value.trim();
      if (query.length < 2) {
        container.innerHTML = "<p class=\"search-tip\">请输入至少 2 个字符。</p>";
        return;
      }

      if (!titleOption.checked && !contentOption.checked && !taxonomyOption.checked) {
        container.innerHTML = "<p class=\"search-tip\">请至少选择一个搜索范围。</p>";
        return;
      }

      const expression = exactOption.checked ?
        "\\b" + escapeRegExp(query) + "\\b" :
        escapeRegExp(query);
      const matcher = new RegExp(expression, "i");
      const results = posts.filter(function (post) {
        return (titleOption.checked && matcher.test(post.title)) ||
          (contentOption.checked && matcher.test(post.content)) ||
          (taxonomyOption.checked && matcher.test(searchableTaxonomy(post)));
      });

      if (!results.length) {
        container.innerHTML = "<div class=\"no-results\">未找到相关文章</div>";
        return;
      }

      container.innerHTML = "<div class=\"search-summary\">找到 " + results.length +
        " 篇相关文章</div>" + results.map(function (post) {
          return "<article class=\"search-result-item\"><div class=\"search-result-header\">" +
            "<span class=\"search-result-date\">" + escapeHTML(post.date) + "</span>" +
            "<span class=\"search-result-category\">" + escapeHTML(post.category) + "</span></div>" +
            "<h3 class=\"search-result-title\"><a href=\"" + escapeHTML(post.url) + "\">" +
            highlight(post.title, query, exactOption.checked) + "</a></h3>" +
            "<p class=\"search-result-excerpt\">" +
            highlight(post.excerpt, query, exactOption.checked) + "</p></article>";
        }).join("");
    }

    const debouncedRun = debounce(run, 200);
    [input, titleOption, contentOption, taxonomyOption, exactOption].forEach(function (element) {
      element.addEventListener(element === input ? "input" : "change", debouncedRun);
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q");
    if (initialQuery) {
      input.value = initialQuery;
      run();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQuickSearch();
    initFullSearch();
  });
}());
