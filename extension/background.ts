chrome.runtime.onInstalled.addListener(() => {
  console.log("OpenDevUtils Chrome extension installed");
});

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("extension/index.html");
  const tabs = await chrome.tabs.query({ url });

  if (tabs.length > 0 && tabs[0].id && tabs[0].windowId !== undefined) {
    await chrome.windows.update(tabs[0].windowId, { focused: true });
    await chrome.tabs.update(tabs[0].id, { active: true });
    return;
  }

  const currentWindow = await chrome.windows.getCurrent();
  const fallbackWidth = 1200;
  const fallbackHeight = 800;
  const width = Math.max(fallbackWidth, currentWindow.width ?? fallbackWidth);
  const height = Math.max(fallbackHeight, currentWindow.height ?? fallbackHeight);

  await chrome.windows.create({
    url,
    type: "popup",
    width,
    height,
    left: currentWindow.left,
    top: currentWindow.top,
  });
});
