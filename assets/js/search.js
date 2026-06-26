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
    return [post.category].concat(post.tags || []).join(" ");
  }

  function matches(value, matcher) {
    matcher.lastIndex = 0;
    return matcher.test(String(value || ""));
  }

  function scorePost(post, matcher, fields) {
    let score = 0;
    if (fields.title && matches(post.title, matcher)) score += 8;
    if (fields.taxonomy && matches(searchableTaxonomy(post), matcher)) score += 4;
    if (fields.content && matches(post.content, matcher)) score += 1;
    return score;
  }

  function initQuickSearch() {
    const input = document.getElementById("quick-search-input");
    const container = document.getElementById("quick-search-results");
    if (!input || !container) return;
    let activeIndex = -1;
    let currentResults = [];

    function setExpanded(expanded) {
      input.setAttribute("aria-expanded", String(expanded));
      container.hidden = !expanded;
      if (!expanded) {
        activeIndex = -1;
        input.removeAttribute("aria-activedescendant");
      }
    }

    function setActiveResult(index) {
      const options = container.querySelectorAll("[role=\"option\"]");
      options.forEach(function (option) {
        option.setAttribute("aria-selected", "false");
      });
      activeIndex = index;
      if (activeIndex < 0 || !options[activeIndex]) {
        input.removeAttribute("aria-activedescendant");
        return;
      }
      options[activeIndex].setAttribute("aria-selected", "true");
      input.setAttribute("aria-activedescendant", options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function renderResults(results) {
      currentResults = results;
      activeIndex = -1;
      container.innerHTML = results.length ? results.map(function (post, index) {
        return "<a id=\"quick-search-option-" + index + "\" role=\"option\" aria-selected=\"false\"" +
          " class=\"quick-search-result-item\" href=\"" + escapeHTML(post.url) +
          "\"><span class=\"quick-search-result-date\">" + escapeHTML(post.date) +
          "</span><span class=\"quick-search-result-title\">" + escapeHTML(post.title) +
          "</span></a>";
      }).join("") : "<div class=\"no-results\">未找到相关文章</div>";
      setExpanded(true);
    }

    const run = debounce(function () {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        setExpanded(false);
        return;
      }

      const results = posts.filter(function (post) {
        return post.title.toLowerCase().includes(query) ||
          searchableTaxonomy(post).toLowerCase().includes(query);
      }).slice(0, 5);

      renderResults(results);
    }, 200);

    input.addEventListener("input", run);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setExpanded(false);
        return;
      }
      if (!currentResults.length || container.hidden) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveResult((activeIndex + 1) % currentResults.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveResult((activeIndex - 1 + currentResults.length) % currentResults.length);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        window.location.href = currentResults[activeIndex].url;
      }
    });
    document.addEventListener("click", function (event) {
      if (!input.contains(event.target) && !container.contains(event.target)) {
        setExpanded(false);
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
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url);

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
      const fields = {
        title: titleOption.checked,
        content: contentOption.checked,
        taxonomy: taxonomyOption.checked
      };
      const results = posts.map(function (post) {
        return { post: post, score: scorePost(post, matcher, fields) };
      }).filter(function (result) {
        return result.score > 0;
      }).sort(function (left, right) {
        return right.score - left.score ||
          String(right.post.date).localeCompare(String(left.post.date));
      }).map(function (result) {
        return result.post;
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
