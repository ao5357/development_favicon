/**
 * @file
 * The service worker that does background thread work per manifest v3.
 */

/**
 * If the native chrome event completes, this fires separately.
 *
 * @param tabId
 *   The tab Id, primarily to address messaging.
 */
const handleTabUpdate = function (tabId) {
  "use strict";

  // Define locals.
  let ext = {
    "matches": false,
    "orientation": "top",
    "bgcolor": "#ff0000"
  };

  /**
   * Determine whether to do anything after tab is retrieved.
   *
   * @param tab
   *   The tab we are acting on.
   */
  function tabsGetCallback(tab) {
    /**
     * Grab the settings from chrome storage.
     */
    chrome.storage.sync.get('rows', function (items) {
      // This is sort of inefficient, but should scale linearly-ish.
      if (items && items.rows && items.rows.length) {
        for (let i = 0; i < items.rows.length; i++) {
          if (tab.url.match(items.rows[i].pattern) || tab.title.match(items.rows[i].pattern)) {
            ext.matches = true;
            ext.orientation = items.rows[i].orientation;
            ext.bgcolor = items.rows[i].bgcolor;
            break;
          }
        }
      }

      // Only send the trigger to proceed on the tab if there's a regex match.
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
 * This listener kicks everything off.
 *
 * It conditionally dispatches tasks to other listeners if the tab update
 * is complete.
 */
chrome.tabs.onUpdated.addListener(function (tabId, props) {
  "use strict";

  if (props && props.status === "complete") {
    handleTabUpdate(tabId);
  }
});
