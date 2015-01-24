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
    chrome.tabs.executeScript(null, {file:'library/favicon.js'});
    
    if(typeof favicon != undefined)
      chrome.tabs.executeScript(null, {code:'favicon.change("' + canvas.toDataURL() + '");'}); 
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

  // Define semi-globals.
  var tabId = evt.detail.tabId;
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
    chrome.storage.sync.get('rows', function(items){
      if (items.rows.length) {
        for (var i = 0; i < items.rows.length; i++) {
          if (tab.url.match(items.rows[i].pattern)) {
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
          favIconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEVFSYuu6K2kgAAAMxJREFUOMu9UssOgjAQnK0PYvw35M4Nvwmu6IJ8oikm7HpQkFIeQRMn2WS3mU5mugV+BLVNURQ6RYrj+AjAvvkbY8zDIzGzWmu9yrJMmVlF5CAiOxHZ9e+ZthF5GbC27qpFGJ7AXNwBNAB0VEBVZ7NGUYTrlZt+bADYfhwIAAIReU9UVbfuJM8vj77IdslBkpyduSxLzDhwUde1MwdB4PEcASLASTDcOWFeYPA1RjEUMHMRVgksrXGK50UgWudgsEbCfh9860CRphn+jifEvoLrs8T+3wAAAABJRU5ErkJggg==';
        }

        // Pass the match to the next async handler.
        var patternmatch = new CustomEvent('patternmatch', {
          'detail': {
            'ext': ext,
            'favIconUrl': favIconUrl,
            'tabId': tabId
          }
        });
        document.dispatchEvent(patternmatch);
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