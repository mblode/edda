// A small progressive enhancement for the HTML-only public landing proxy.
// Do not depend on Next hydration: that runtime belongs to the product host.
document.addEventListener("click", async (event) => {
  const button =
    event.target instanceof Element
      ? event.target.closest("button[data-copy-command]")
      : null;
  if (!button) {
    return;
  }
  const status = button.parentElement.querySelector("[data-copy-status]");
  try {
    await navigator.clipboard.writeText(button.dataset.copyCommand);
    status.textContent = "Install commands copied.";
  } catch {
    status.textContent =
      "Could not copy. Select the commands below and copy them manually.";
  }
});
