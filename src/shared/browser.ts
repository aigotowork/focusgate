export async function getActiveTabUrl(): Promise<string | undefined> {
  if (typeof chrome === "undefined" || !chrome.tabs?.query) {
    return undefined;
  }

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]?.url);
    });
  });
}

export function openOptionsPage(): void {
  if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
    return;
  }

  window.open("/options.html", "_blank", "noopener,noreferrer");
}

export function getExtensionUrl(path: string): string {
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path);
  }

  return `/${path}`;
}
