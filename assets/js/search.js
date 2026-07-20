(function () {
  "use strict";

  const items = window.siteSearchItems || [];

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

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("zh-CN");
  }

  function queryTokens(query) {
    return normalize(query).split(/\s+/).filter(Boolean);
  }

  function taxonomyText(item) {
    return [item.kindLabel, item.category].concat(item.tags || []).join(" ");
  }

  function scoreItem(item, tokens) {
    const title = normalize(item.title);
    const taxonomy = normalize(taxonomyText(item));
    const content = normalize(item.content);
    let score = 0;

    for (const token of tokens) {
      let tokenScore = 0;
      if (title === token) tokenScore += 120;
      else if (title.startsWith(token)) tokenScore += 60;
      else if (title.includes(token)) tokenScore += 36;
      if (taxonomy.includes(token)) tokenScore += 18;
      if (content.includes(token)) tokenScore += 5;
      if (tokenScore === 0) return 0;
      score += tokenScore;
    }

    return score;
  }

  function search(query, kind) {
    const tokens = queryTokens(query);
    if (!tokens.length) return [];

    return items.map(function (item) {
      if (kind !== "all" && item.kind !== kind) return { item: item, score: 0 };
      return { item: item, score: scoreItem(item, tokens) };
    }).filter(function (result) {
      return result.score > 0;
    }).sort(function (left, right) {
      return right.score - left.score ||
        String(right.item.meta || "").localeCompare(String(left.item.meta || ""));
    }).map(function (result) {
      return result.item;
    });
  }

  function highlight(text, tokens) {
    const terms = Array.from(new Set(tokens)).sort(function (left, right) {
      return right.length - left.length;
    });
    if (!terms.length) return escapeHTML(text);
    const matcher = new RegExp("(" + terms.map(escapeRegExp).join("|") + ")", "gi");
    return String(text || "").split(matcher).map(function (part, index) {
      return index % 2 ? "<mark>" + escapeHTML(part) + "</mark>" : escapeHTML(part);
    }).join("");
  }

  function resultExcerpt(item, tokens) {
    const preferred = String(item.excerpt || "").replace(/\s+/g, " ").trim();
    const content = String(item.content || "").replace(/\s+/g, " ").trim();
    const preferredMatch = tokens.some(function (token) {
      return normalize(preferred).includes(token);
    });
    if (preferred && (preferredMatch || !content)) return preferred;

    const normalizedContent = normalize(content);
    let matchIndex = -1;
    tokens.forEach(function (token) {
      const index = normalizedContent.indexOf(token);
      if (index >= 0 && (matchIndex < 0 || index < matchIndex)) matchIndex = index;
    });
    if (matchIndex < 0) return preferred || content.slice(0, 180);
    const start = Math.max(0, matchIndex - 45);
    const end = Math.min(content.length, start + 180);
    return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
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
      container.innerHTML = results.length ? results.map(function (item, index) {
        return "<a id=\"quick-search-option-" + index + "\" role=\"option\" aria-selected=\"false\"" +
          " class=\"quick-search-result-item\" href=\"" + escapeHTML(item.url) + "\">" +
          "<span class=\"quick-search-result-date\">" + escapeHTML(item.kindLabel) + "</span>" +
          "<span class=\"quick-search-result-title\">" + escapeHTML(item.title) + "</span></a>";
      }).join("") : "<div class=\"no-results\">未找到相关内容</div>";
      setExpanded(true);
    }

    const run = debounce(function () {
      const query = input.value.trim();
      if (query.length < 2) {
        setExpanded(false);
        return;
      }
      renderResults(search(query, "all").slice(0, 6));
    }, 160);

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
      if (!input.contains(event.target) && !container.contains(event.target)) setExpanded(false);
    });
  }

  function initFullSearch() {
    const input = document.getElementById("search-input");
    const clearButton = document.getElementById("search-clear");
    const container = document.getElementById("search-results");
    const scopeButtons = Array.from(document.querySelectorAll("[data-search-kind]"));
    if (!input || !container) return;
    let activeKind = "all";

    function setScope(kind) {
      activeKind = kind;
      scopeButtons.forEach(function (button) {
        const isActive = button.dataset.searchKind === kind;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function updateURL(query) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      if (activeKind !== "all") url.searchParams.set("type", activeKind);
      else url.searchParams.delete("type");
      window.history.replaceState({}, "", url);
    }

    function run() {
      const query = input.value.trim();
      const tokens = queryTokens(query);
      updateURL(query);
      if (clearButton) clearButton.hidden = query === "";

      if (query.length < 2) {
        container.innerHTML = "<p class=\"search-tip\">输入至少两个字符开始搜索。</p>";
        return;
      }

      const results = search(query, activeKind);
      if (!results.length) {
        container.innerHTML = "<div class=\"no-results\"><strong>没有找到相关内容</strong><span>试试更短的关键词，或切换到“全部”。</span></div>";
        return;
      }

      container.innerHTML = "<div class=\"search-summary\">找到 <strong>" + results.length +
        "</strong> 项内容</div>" + results.map(function (item) {
          const excerpt = resultExcerpt(item, tokens);
          return "<article class=\"search-result-item\">" +
            "<div class=\"search-result-header\"><span class=\"search-result-kind search-result-kind--" +
            escapeHTML(item.kind) + "\">" + escapeHTML(item.kindLabel) + "</span>" +
            "<span class=\"search-result-meta\">" + escapeHTML(item.meta) + "</span>" +
            (item.category ? "<span class=\"search-result-category\">" + escapeHTML(item.category) + "</span>" : "") +
            "</div><h2 class=\"search-result-title\"><a href=\"" + escapeHTML(item.url) + "\">" +
            highlight(item.title, tokens) + "</a></h2>" +
            (excerpt ? "<p class=\"search-result-excerpt\">" + highlight(excerpt, tokens) + "</p>" : "") +
            "</article>";
        }).join("");
    }

    const debouncedRun = debounce(run, 140);
    input.addEventListener("input", debouncedRun);
    scopeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setScope(button.dataset.searchKind);
        run();
      });
    });
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        input.focus();
        run();
      });
    }

    const parameters = new URLSearchParams(window.location.search);
    const initialKind = parameters.get("type");
    if (scopeButtons.some(function (button) { return button.dataset.searchKind === initialKind; })) {
      setScope(initialKind);
    }
    const initialQuery = parameters.get("q");
    if (initialQuery) input.value = initialQuery;
    run();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQuickSearch();
    initFullSearch();
  });
}());
