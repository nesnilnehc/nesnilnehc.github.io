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

  function applyMovieFilters() {
    const activeTag = activeFilterValue("[data-movie-filter]", "movieFilter");
    const activeDirector = activeFilterValue("[data-movie-director-filter]", "movieDirectorFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll("[data-movie-tags]")).forEach(function (entry) {
      const tags = splitValues(entry.dataset.movieTags);
      const tagMatches = activeTag === "all" || tags.includes(activeTag);
      const directorMatches = activeDirector === "all" || entry.dataset.movieDirector === activeDirector;
      const isVisible = tagMatches && directorMatches;
      entry.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    announce("已筛选出 " + visibleCount + " 部电影。");
  }

  function applyMusicFilters() {
    const activeArtist = activeFilterValue("[data-music-filter]", "musicFilter");
    const activeTag = activeFilterValue("[data-music-tag-filter]", "musicTagFilter");
    let visibleCount = 0;

    Array.from(document.querySelectorAll("[data-music-artists]")).forEach(function (entry) {
      const artists = splitValues(entry.dataset.musicArtists);
      const tags = splitValues(entry.dataset.musicTags);
      const artistMatches = activeArtist === "all" || artists.includes(activeArtist);
      const tagMatches = activeTag === "all" || tags.includes(activeTag);
      const isVisible = artistMatches && tagMatches;
      entry.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    announce("已筛选出 " + visibleCount + " 首音乐。");
  }

  Array.from(document.querySelectorAll("[data-movie-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-movie-director-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-movie-director-filter]");
      applyMovieFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-filter]");
      applyMusicFilters();
    });
  });

  Array.from(document.querySelectorAll("[data-music-tag-filter]")).forEach(function (button) {
    button.addEventListener("click", function () {
      setActiveButton(button, "[data-music-tag-filter]");
      applyMusicFilters();
    });
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
