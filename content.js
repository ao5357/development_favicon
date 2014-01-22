chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var link = document.querySelector("link[rel~='icon'], link[rel~='ICON'");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.type = "image/x-icon";
    document.head.appendChild(link);
  }
  link.href = message.favIconUrl;
});