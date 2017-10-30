/**
 * Listener for the "patternmatch" CustomEvent.
 *
 * Event is dispatched only if a match is found
 * in the "tabupdate" cycle.
 */
document.addEventListener("patternmatch", function(evt) {
  "use strict";

  // Define scoped pseudo-globals.
  var ext = evt.detail.ext,
  tabId = evt.detail.tabId,
  favIconUrl = evt.detail.favIconUrl,
  holder = document.createElement("img");
  holder.addEventListener("load", imageLoadCallback);

  /**
   * Build out the canvas only after the favicon loads.
   */
  function imageLoadCallback(evt) {
    // Transpose the icon into a canvas.
    var canvas = document.createElement("canvas");
    canvas.width = holder.width;
    canvas.height = holder.height;
    var context = canvas.getContext("2d");
    context.drawImage(holder, 0, 0);

    // Draw the effect based on the user dropdown.
    context.fillStyle = ext.bgcolor;

    switch (ext.orientation) {
      case 'right':
        context.fillRect(Math.floor(canvas.width * .75), 0, Math.floor(canvas.width / 4), canvas.height);
        break;
      case 'bottom':
        context.fillRect(0, Math.floor(canvas.height * .75), canvas.width, Math.floor(canvas.height / 4));
        break;
      case 'left':
        context.fillRect(0, 0, Math.floor(canvas.width / 4), canvas.height);
        break;
      case 'cover':
        context.globalAlpha = 0.5;
        context.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'replace':
        context.globalCompositeOperation = "source-in";
        context.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'background':
        context.globalCompositeOperation = "destination-over";
        context.fillRect(0, 0, canvas.width, canvas.height);
        break;
      case 'xor-top':
        context.globalCompositeOperation = "xor";
        context.fillRect(0, 0, canvas.width, Math.floor(canvas.height / 4));
        break;
      default:
        context.fillRect(0, 0, canvas.width, Math.floor(canvas.height / 4));
        break;
    }

    // Pass the icon to the content script.
    chrome.tabs.sendMessage(tabId, {
      "favIconUrl": canvas.toDataURL()
    });
  }

  // Trigger the image load event.
  holder.src = favIconUrl;
}, false);

/**
 * If the native chrome event returns complete, this
 * event gets fired separately.
 */
document.addEventListener("tabupdate", function(evt) {
  "use strict";

  // Define locals.
  var tabId = evt.detail.tabId;
  var ext = {
    "matches": false,
    "orientation": "top",
    "bgcolor": "#ff0000"
  };

  // Trigger the patternmatch event. 
  function dispatchPatternmatch(evt) {
    // Pass the match to the next async handler.
    var patternmatch = new CustomEvent('patternmatch', evt);
    document.dispatchEvent(patternmatch);
  }

  /**
   * Determine whether to do anything after tab is retrieved.
   */
  function tabsGetCallback(tab) {
    /**
     * Grab the settings from chrome storage.
     */
    chrome.storage.sync.get('rows', function(items){
      if (items.rows.length) {
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
        var favIconUrl = tab.favIconUrl;
        if(!favIconUrl) {
          // Set the default favicon to the default favicon.
          chrome.tabs.sendMessage(tabId, {'null': 'null'}, function(response){
            if (response && response.favIconUrl) {
              favIconUrl = response.favIconUrl;
            }
            dispatchPatternmatch({
              'detail': {
                'ext': ext,
                'favIconUrl': favIconUrl,
                'tabId': tabId
              }
            });
          });
        }
        else {
          dispatchPatternmatch({
            'detail': {
              'ext': ext,
              'favIconUrl': favIconUrl,
              'tabId': tabId
            }
          });
        }
      }
    });
  }

  // Trigger the callback, based on the tabId sent to this handler.
  chrome.tabs.get(tabId, tabsGetCallback);
}, false);

/**
 * This listener kicks everything off, and conditionally
 * dispatches tasks to other listeners if the tab update
 * is complete.
 */
chrome.tabs.onUpdated.addListener(function(tabId, props) {
  "use strict";
  if (props.status === "complete") {
    var tabupdate = new CustomEvent('tabupdate', {'detail':{'tabId': tabId}});
    document.dispatchEvent(tabupdate);
  }
});