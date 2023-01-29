/**
 * If the native chrome event returns complete, this
 * event gets fired separately.
 */
handleTabUpdate = function (tabId) {
  "use strict";

  // Define locals.
  var ext = {
    "matches": false,
    "orientation": "top",
    "bgcolor": "#ff0000"
  };

  /**
   * Determine whether to do anything after tab is retrieved.
   */
  function tabsGetCallback(tab) {
    /**
     * Grab the settings from chrome storage.
     */
    chrome.storage.sync.get('rows', function (items) {
      if (items && items.rows && items.rows.length) {
        for (var i = 0; i < items.rows.length; i++) {
          if (tab.url.match(items.rows[i].pattern) || tab.title.match(items.rows[i].pattern)) {
            ext.matches = true;
            ext.orientation = items.rows[i].orientation;
            ext.bgcolor = items.rows[i].bgcolor;
            break;
          }
        }
      }

      if (ext.matches) {
        chrome.tabs.sendMessage(tabId, {
          "action": "applyMatch",
          "data": {
            'ext': ext,
            'favIconUrl': tab.favIconUrl,
          }
        });
      }
    });
  }

  // Trigger the callback, based on the tabId sent to this handler.
  chrome.tabs.get(tabId, tabsGetCallback);
};

/**
 * This listener kicks everything off, and conditionally
 * dispatches tasks to other listeners if the tab update
 * is complete.
 */
chrome.tabs.onUpdated.addListener(function (tabId, props) {
  "use strict";
  if (props.status === "complete") {
    handleTabUpdate(tabId);
  }
});