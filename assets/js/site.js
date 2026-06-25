(function () {
  "use strict";

  function showButtonState(button, label) {
    const original = button.textContent;
    button.textContent = label;
    setTimeout(function () {
      button.textContent = original;
    }, 1800);
  }

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
    }).catch(function () {
      window.prompt("复制以下内容", content);
    });
  });
}());
