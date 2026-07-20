(function () {
  "use strict";

  function showButtonState(button, label) {
    const original = button.textContent;
    button.textContent = label;
    setTimeout(function () {
      button.textContent = original;
    }, 1800);
  }

  function announce(message) {
    const announcer = document.getElementById("site-announcer");
    if (!announcer) return;
    announcer.textContent = "";
    window.setTimeout(function () {
      announcer.textContent = message;
    }, 50);
  }

  const navigationToggle = document.getElementById("nav-trigger");
  if (navigationToggle) {
    navigationToggle.addEventListener("change", function () {
      navigationToggle.setAttribute("aria-expanded", String(navigationToggle.checked));
    });
  }

  function splitValues(value) {
    return (value || "").split("|").filter(Boolean);
  }

  function setActiveButton(button, selector) {
    Array.from(document.querySelectorAll(selector)).forEach(function (item) {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
  }

  function activeFilterValue(selector, dataKey) {
    const activeButton = document.querySelector(selector + ".is-active");
    return activeButton ? activeButton.dataset[dataKey] : "all";
  }

  function updateEntryIndexes(selector) {
    let visibleIndex = 0;

    Array.from(document.querySelectorAll(selector)).forEach(function (entry) {
      if (entry.hidden) return;
      visibleIndex += 1;
      const index = entry.querySelector(".movie-entry__index, .music-entry__index, .book-entry__index, .poetry-entry__index");
      if (!index) return;
      index.textContent = String(visibleIndex).padStart(2, "0");
    });
  }

  function compareCollectionEntries(left, right, prefix, mode) {
    const leftCount = Number(left.dataset[prefix + "Count"] || 0);
    const rightCount = Number(right.dataset[prefix + "Count"] || 0);
    const leftDate = left.dataset[prefix + "Date"] || "";
    const rightDate = right.dataset[prefix + "Date"] || "";
    const leftOrder = Number(left.dataset[prefix + "Order"] || 0);
    const rightOrder = Number(right.dataset[prefix + "Order"] || 0);

    if (mode === "count" && leftCount !== rightCount) return rightCount - leftCount;
    if (leftDate !== rightDate) return rightDate.localeCompare(leftDate);
    if (mode !== "count" && leftCount !== rightCount) return rightCount - leftCount;
    return leftOrder - rightOrder;
  }

  function groupLabel(entry, prefix, mode) {
    if (mode === "count") {
      return "喜欢 " + Number(entry.dataset[prefix + "Count"] || 0) + " 次";
    }

    const date = entry.dataset[prefix + "Date"] || "";
    return date.slice(0, 4) || "未知年份";
  }

  function createGroupHeading(label, prefix) {
    const heading = document.createElement("h2");
    heading.className = "collection-group-heading";
    heading.dataset[prefix + "GroupHeading"] = "true";
    heading.textContent = label;
    return heading;
  }

  function sortCollection(shelfSelector, entrySelector, prefix, mode) {
    const shelf = document.querySelector(shelfSelector);
    if (!shelf) return;

    Array.from(shelf.querySelectorAll(".collection-group-heading")).forEach(function (heading) {
      heading.remove();
    });

    const entries = Array.from(shelf.querySelectorAll(entrySelector)).sort(function (left, right) {
      return compareCollectionEntries(left, right, prefix, mode);
    });
    let currentGroup = "";

    entries.forEach(function (entry) {
      if (!entry.hidden) {
        const nextGroup = groupLabel(entry, prefix, mode);
        if (nextGroup !== currentGroup) {
          currentGroup = nextGroup;
          shelf.appendChild(createGroupHeading(currentGroup, prefix));
        }
      }

        shelf.appendChild(entry);
    });

    updateEntryIndexes(entrySelector);
  }

  function applyMovieFilters() {
    const activeType = activeFilterValue("[data-movie-type-filter]", "movieTypeFilter");
    const activeTag = activeFilterValue("[data-movie-filter]", "movieFilter");
    const activeDirector = activeFilterValue("[data-movie-director-filter]", "movieDirectorFilter");
    const activeCast = activeFilterValue("[data-movie-cast-filter]", "movieCastFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll("[data-movie-tags]")).forEach(function (entry) {
      const tags = splitValues(entry.dataset.movieTags);
      const cast = splitValues(entry.dataset.movieCast);
      const directors = splitValues(entry.dataset.movieDirector);
      const typeMatches = activeType === "all" || entry.dataset.movieType === activeType;
      const tagMatches = activeTag === "all" || tags.includes(activeTag);
      const directorMatches = activeDirector === "all" || directors.includes(activeDirector);
      const castMatches = activeCast === "all" || cast.includes(activeCast);
      const isVisible = typeMatches && tagMatches && directorMatches && castMatches;
      entry.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    sortCollection(".movie-shelf", ".movie-entry", "movie", activeFilterValue("[data-movie-sort]", "movieSort"));
    announce("已筛选出 " + visibleCount + " 部影视作品。");
  }

  function applyMusicFilters() {
    const activeArtist = activeFilterValue("[data-music-filter]", "musicFilter");
    const activeLanguage = activeFilterValue("[data-music-language-filter]", "musicLanguageFilter");
    const activeGenre = activeFilterValue("[data-music-genre-filter]", "musicGenreFilter");
    const activeTag = activeFilterValue("[data-music-tag-filter]", "musicTagFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll("[data-music-artists]")).forEach(function (entry) {
      const artists = splitValues(entry.dataset.musicArtists);
      const languages = splitValues(entry.dataset.musicLanguages);
      const tags = splitValues(entry.dataset.musicTags);
      const artistMatches = activeArtist === "all" || artists.includes(activeArtist);
      const languageMatches = activeLanguage === "all" || languages.includes(activeLanguage);
      const genreMatches = activeGenre === "all" || entry.dataset.musicGenre === activeGenre;
      const tagMatches = activeTag === "all" || tags.includes(activeTag);
      const isVisible = artistMatches && languageMatches && genreMatches && tagMatches;
      entry.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    sortCollection(".music-shelf", ".music-entry", "music", activeFilterValue("[data-music-sort]", "musicSort"));
    announce("已筛选出 " + visibleCount + " 首音乐。");
  }

  function applyBookFilters() {
    const activeAuthor = activeFilterValue("[data-book-author-filter]", "bookAuthorFilter");
    const activeCategory = activeFilterValue("[data-book-category-filter]", "bookCategoryFilter");
    const activeTag = activeFilterValue("[data-book-tag-filter]", "bookTagFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll("[data-book-authors]")).forEach(function (entry) {
      const authors = splitValues(entry.dataset.bookAuthors);
      const tags = splitValues(entry.dataset.bookTags);
      const authorMatches = activeAuthor === "all" || authors.includes(activeAuthor);
      const categoryMatches = activeCategory === "all" || entry.dataset.bookCategory === activeCategory;
      const tagMatches = activeTag === "all" || tags.includes(activeTag);
      const isVisible = authorMatches && categoryMatches && tagMatches;
      entry.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    sortCollection(".book-shelf", ".book-entry", "book", activeFilterValue("[data-book-sort]", "bookSort"));
    announce("已筛选出 " + visibleCount + " 本书籍。");
  }

  function applyPoetryFilters(shouldAnnounce) {
    const activePeriod = activeFilterValue("[data-poetry-period-filter]", "poetryPeriodFilter");
    const activeType = activeFilterValue("[data-poetry-type-filter]", "poetryTypeFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll(".poetry-entry[data-poetry-period]")).forEach(function (entry) {
      const periodMatches = activePeriod === "all" || entry.dataset.poetryPeriod === activePeriod;
      const typeMatches = activeType === "all" || entry.dataset.poetryType === activeType;
      const isVisible = periodMatches && typeMatches;
      entry.hidden = !isVisible;
      if (!isVisible) entry.open = false;
      if (isVisible) visibleCount += 1;
    });

    updateEntryIndexes(".poetry-entry[data-poetry-period]");

    const resultCount = document.querySelector("[data-poetry-result-count]");
    const emptyState = document.querySelector("[data-poetry-empty]");
    if (resultCount) resultCount.textContent = "共 " + visibleCount + " 篇";
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (shouldAnnounce !== false) announce("已筛选出 " + visibleCount + " 篇诗文。");
  }

  Array.from(document.querySelectorAll("[data-movie-sort]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-sort]");
      sortCollection(".movie-shelf", ".movie-entry", "movie", button.dataset.movieSort);
      announce(button.dataset.movieSort === "count" ? "已按喜欢次数排序影视作品。" : "已按时间排序影视作品。");
    });
  });

  Array.from(document.querySelectorAll("[data-music-sort]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-sort]");
      sortCollection(".music-shelf", ".music-entry", "music", button.dataset.musicSort);
      announce(button.dataset.musicSort === "count" ? "已按喜欢次数排序音乐。" : "已按时间排序音乐。");
    });
  });

  Array.from(document.querySelectorAll("[data-book-sort]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-book-sort]");
      sortCollection(".book-shelf", ".book-entry", "book", button.dataset.bookSort);
      announce(button.dataset.bookSort === "count" ? "已按喜欢次数排序书籍。" : "已按时间排序书籍。");
    });
  });

  Array.from(document.querySelectorAll("[data-movie-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-movie-type-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-type-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-movie-director-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-director-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-movie-cast-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-cast-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-filter]");
      applyMusicFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-language-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-language-filter]");
      applyMusicFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-genre-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-genre-filter]");
      applyMusicFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-tag-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-tag-filter]");
      applyMusicFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-book-author-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-book-author-filter]");
      applyBookFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-book-category-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-book-category-filter]");
      applyBookFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-book-tag-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-book-tag-filter]");
      applyBookFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-poetry-period-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-poetry-period-filter]");
      applyPoetryFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-poetry-type-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-poetry-type-filter]");
      applyPoetryFilters();
    });
  });

  sortCollection(".movie-shelf", ".movie-entry", "movie", activeFilterValue("[data-movie-sort]", "movieSort"));
  sortCollection(".music-shelf", ".music-entry", "music", activeFilterValue("[data-music-sort]", "musicSort"));
  sortCollection(".book-shelf", ".book-entry", "book", activeFilterValue("[data-book-sort]", "bookSort"));
  applyPoetryFilters(false);

  function setupCollapsibleFilters() {
    var maxRows = 2;

    Array.from(document.querySelectorAll(".movie-filter__controls, .music-filter__controls, .book-filter__controls, .poetry-filter__controls")).forEach(function (controls) {
      var toggleClass = controls.classList.contains("movie-filter__controls") ? "movie-filter__toggle" : controls.classList.contains("music-filter__controls") ? "music-filter__toggle" : controls.classList.contains("book-filter__controls") ? "book-filter__toggle" : "poetry-filter__toggle";
      var existingToggle = controls.nextElementSibling;
      var wasExpanded = Boolean(existingToggle) && existingToggle.classList.contains(toggleClass) && existingToggle.getAttribute("aria-expanded") === "true";
      if (existingToggle && existingToggle.classList.contains(toggleClass)) existingToggle.remove();
      controls.classList.remove("is-collapsed");
      controls.style.removeProperty("--filter-collapsed-height");

      var rowTops = [];
      Array.from(controls.children).forEach(function (button) {
        if (!rowTops.includes(button.offsetTop)) rowTops.push(button.offsetTop);
      });
      if (rowTops.length <= maxRows) return;

      controls.style.setProperty("--filter-collapsed-height", (rowTops[maxRows] - rowTops[0]) + "px");
      if (!wasExpanded) controls.classList.add("is-collapsed");

      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = toggleClass;
      toggle.setAttribute("aria-expanded", String(wasExpanded));
      toggle.textContent = wasExpanded ? "收起" : "展开全部";
      toggle.addEventListener("click", function () {
        var isCollapsed = controls.classList.toggle("is-collapsed");
        toggle.textContent = isCollapsed ? "展开全部" : "收起";
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
      });
      controls.insertAdjacentElement("afterend", toggle);
    });
  }

  setupCollapsibleFilters();

  var filterResizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(filterResizeTimer);
    filterResizeTimer = window.setTimeout(setupCollapsibleFilters, 200);
  });

  document.addEventListener("click", function (event) {
    const button = event.target.closest(".js-share-post");
    if (!button) return;

    const shareData = {
      title: button.dataset.title,
      text: button.dataset.text,
      url: button.dataset.url
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
      return;
    }

    const content = [shareData.title, shareData.text, shareData.url].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(content).then(function () {
      showButtonState(button, "已复制");
      announce("文章标题、摘要和链接已复制。");
    }).catch(function () {
      window.prompt("复制以下内容", content);
    });
  });
}());
