function displayData(data) {
  document.getElementById("mineId").value = data.mineId || "";
  document.getElementById("factoryId").value = data.factoryId || "";
  document.getElementById("areaId").value = data.areaId || "";
  document.getElementById("jwt").value = data.jwt || "";
}

chrome.runtime.sendMessage("getExtractedData", function(data) {
  displayData(data || {});
});

document.getElementById("copyAll").onclick = function() {
  chrome.runtime.sendMessage("getExtractedData", function(data) {
    const out = JSON.stringify({
      mineId_1: data.mineId || "",
      factoryId_1: data.factoryId || "",
      areaId_1: data.areaId || "",
      jwt: data.jwt || ""
    }, null, 2);
    navigator.clipboard.writeText(out);
    document.getElementById("copied").style.display = "inline";
    setTimeout(() => document.getElementById("copied").style.display = "none", 1500);
  });
};
