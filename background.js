let extractedData = {
  mineId: "",
  factoryId: "",
  areaId: "",
  jwt: ""
};

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method === "POST" && details.url.includes("user-actions/ingest")) {
      if (details.requestBody && details.requestBody.raw && details.requestBody.raw.length > 0) {
        try {
          const decoder = new TextDecoder("utf-8");
          const jsonString = decoder.decode(details.requestBody.raw[0].bytes);
          const data = JSON.parse(jsonString);

          data.data?.forEach(entry => {
            if (entry.actionType === "START_MINE" && entry.payload?.mineId) {
              extractedData.mineId = entry.payload.mineId;
            }
            if (entry.actionType === "START_FACTORY" && entry.payload?.factoryId) {
              extractedData.factoryId = entry.payload.factoryId;
            }
            if (entry.actionType === "CLAIM_AREA" && entry.payload?.areaId) {
              extractedData.areaId = entry.payload.areaId;
            }
          });

          chrome.storage.local.set({ extractedData });
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  },
  { urls: ["*://*.craft-world.gg/*"] },
  ["requestBody"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (const h of details.requestHeaders) {
      if (h.name.toLowerCase() === "authorization" && h.value.startsWith("Bearer jwt_")) {
        extractedData.jwt = h.value.replace("Bearer jwt_", "");
        chrome.storage.local.set({ extractedData });
        break;
      }
    }
  },
  { urls: ["*://*.craft-world.gg/*"] },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "getExtractedData") {
    chrome.storage.local.get("extractedData", data => {
      sendResponse(data.extractedData || {});
    });
    return true; // Required for async sendResponse
  }
});
