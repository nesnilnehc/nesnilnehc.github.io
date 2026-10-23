(function () {
  "use strict";
  const panel = document.querySelector("[data-collection-analytics]");
  if (!panel || !window.LikeCount) return;
  const kind = panel.dataset.collectionAnalytics;
  const toggle = document.querySelector("[data-analytics-toggle]");
  const model = window.LikeCount;
  const unit = kind === "music" ? "首" : "部";
  const entries = Array.from(document.querySelectorAll("." + kind + "-entry"))
    .sort((a, b) => Number(a.dataset[kind + "Order"]) - Number(b.dataset[kind + "Order"]));
  const items = entries.map((entry, index) => {
    if (!entry.id) entry.id = kind + "-analytics-entry-" + index;
    entry.tabIndex = -1;
    return {entry, id: entry.id, title: entry.querySelector("h2").textContent.trim(), count: entry.dataset[kind + "Count"]};
  });
  let baseline = items.slice();
  let selected = null;

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function percent(value) {
    return value === null ? "—" : (value * 100).toFixed(1) + "%";
  }

  function target(name) {
    return panel.querySelector("[data-analytics-" + name + "]");
  }

  function table(headers, rows) {
    const node = element("table");
    const head = element("thead");
    const heading = element("tr");
    headers.forEach(label => {
      const cell = element("th", label);
      cell.scope = "col";
      heading.appendChild(cell);
    });
    head.appendChild(heading);
    node.appendChild(head);
    const body = element("tbody");
    rows.forEach(row => {
      const line = element("tr");
      row.forEach(value => line.appendChild(element("td", String(value))));
      body.appendChild(line);
    });
    node.appendChild(body);
    return node;
  }

  function applySelection() {
    const visible = new Set(model.selectCount(baseline, selected));
    items.forEach(item => { item.entry.hidden = !visible.has(item); });
    panel.querySelectorAll("[data-count-choice]").forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.countChoice) === selected));
    });
    const selection = target("selection");
    selection.replaceChildren();
    if (selected !== null) {
      selection.appendChild(element("span", "列表：喜欢 " + selected + " 次 · " + visible.size + unit));
      const clear = element("button", "清除次数筛选", "analytics-text-button");
      clear.type = "button";
      clear.addEventListener("click", () => {
        const previous = selected;
        selected = null;
        applySelection();
        panel.querySelector('[data-count-choice="' + previous + '"]').focus();
      });
      selection.appendChild(clear);
    }
    document.dispatchEvent(new CustomEvent("collection-visibility", {detail: {kind}}));
  }

  function render() {
    const result = model.analyze(baseline);
    const filters = Array.from(document.querySelectorAll(".collection-filters button.is-active"))
      .filter(button => !button.hasAttribute("data-" + kind + "-sort"))
      .filter(button => Object.values(button.dataset).some(value => value !== "all"));
    target("scope").textContent = (filters.length ? filters.map(b => b.textContent.trim()).join(" · ") : "全部收藏") +
      " · " + baseline.length + unit + " · 有效记录 " + result.valid + unit;
    const warning = target("warning");
    warning.hidden = result.invalid === 0;
    warning.textContent = result.invalid + " 条次数缺失或无效，统计仅包含有效记录。";
    const metrics = target("metrics");
    metrics.replaceChildren();
    [
      ["累计喜欢次数", result.valid ? result.total + " 次" : "—", "有效记录次数之和"],
      ["多次喜欢条目", result.repeated + unit + " / " + percent(result.repeatedShare), "占有效条目 " + result.repeated + "/" + result.valid],
      ["多次喜欢贡献占比", percent(result.contribution), "占有效记录累计喜欢次数"]
    ].forEach(([label, value, note]) => {
      const group = element("div");
      group.append(element("dt", label), element("dd", value), element("dd", note, "collection-analytics__note"));
      metrics.appendChild(group);
    });
    const distribution = target("distribution");
    distribution.replaceChildren();
    const max = Math.max(1, ...result.distribution.map(bucket => bucket.size));
    result.distribution.forEach(bucket => {
      const button = element("button", undefined, "like-distribution__column");
      button.type = "button";
      button.dataset.countChoice = String(bucket.count);
      button.setAttribute("aria-label", "喜欢 " + bucket.count + " 次：" + bucket.size + unit + "，占有效条目 " + percent(bucket.share));
      button.setAttribute("aria-pressed", "false");
      const bar = element("span", undefined, "like-distribution__bar");
      bar.style.height = (bucket.size / max * 140) + "px";
      button.append(element("span", bucket.size + unit), element("span", percent(bucket.share), "collection-analytics__note"), bar, element("span", bucket.count + " 次"));
      button.addEventListener("click", () => { selected = selected === bucket.count ? null : bucket.count; applySelection(); });
      distribution.appendChild(button);
    });
    if (!result.valid) distribution.appendChild(element("p", baseline.length ? "暂无有效次数记录" : "当前筛选下暂无作品"));
    const ranking = target("ranking");
    ranking.replaceChildren();
    const maximum = result.top.length ? model.parseCount(result.top[0].count) : 1;
    result.top.forEach(item => {
      const row = element("div", undefined, "like-ranking__row");
      const link = element("a", item.title);
      link.href = "#" + item.id;
      link.addEventListener("click", event => {
        event.preventDefault();
        selected = null;
        applySelection();
        item.entry.focus({preventScroll: true});
        item.entry.scrollIntoView({block: "start", behavior: "instant"});
      });
      const track = element("span", undefined, "like-ranking__track");
      const bar = element("span", undefined, "like-ranking__bar");
      bar.style.width = (model.parseCount(item.count) / maximum * 100) + "%";
      track.appendChild(bar);
      row.append(link, element("span", item.count + " 次", "like-ranking__count"), track);
      ranking.appendChild(row);
    });
    if (!result.top.length) {
      const allOne = result.valid && result.distribution.length === 1 && result.distribution[0].count === 1;
      ranking.appendChild(element("p", !result.valid ? "暂无可统计作品" : allOne ? "所有作品均记录为 1 次，暂无次数差异" : "暂无喜欢次数至少 2 次的作品"));
    }
    target("distribution-table").replaceChildren(table(["喜欢次数", "条目数", "占有效条目"], result.distribution.map(b => [b.count, b.size, percent(b.share)])));
    target("ranking-table").replaceChildren(table(["作品", "喜欢次数"], result.top.map(item => [item.title, item.count])));
    applySelection();
  }

  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    if (panel.hidden && selected !== null) {
      selected = null;
      applySelection();
    }
  });
  document.addEventListener("collection-filter", event => {
    if (event.detail.kind !== kind) return;
    baseline = items.filter(item => !item.entry.hidden);
    selected = null;
    render();
  });
  render();
}());
