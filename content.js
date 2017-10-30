chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var links,
      i;

  if (!message.favIconUrl) {
  	// Set a default to pass back.
	var favIconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEVFSYuu6K2kgAAAMxJREFUOMu9UssOgjAQnK0PYvw35M4Nvwmu6IJ8oikm7HpQkFIeQRMn2WS3mU5mugV+BLVNURQ6RYrj+AjAvvkbY8zDIzGzWmu9yrJMmVlF5CAiOxHZ9e+ZthF5GbC27qpFGJ7AXNwBNAB0VEBVZ7NGUYTrlZt+bADYfhwIAAIReU9UVbfuJM8vj77IdslBkpyduSxLzDhwUde1MwdB4PEcASLASTDcOWFeYPA1RjEUMHMRVgksrXGK50UgWudgsEbCfh9860CRphn+jifEvoLrs8T+3wAAAABJRU5ErkJggg==';

  	// Find an existing favicon to use as the URL.
    links = document.head.getElementsByTagName("link");
    for (i=0; i<links.length; i++) {
      if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {
        favIconUrl = links[i].href;
      }
    }

    // Send either the URL or the default.
    sendResponse({'favIconUrl': favIconUrl});
  }
  else {
    // Create a new favicon link.
    var favicon = document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.type = "image/x-icon";
    favicon.href = message.favIconUrl;

    // Remove existing favicon links.
    links = document.head.getElementsByTagName("link");
    for (i=0; i<links.length; i++) {
      if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {
        document.head.removeChild(links[i]);
      }
    }

    // Append the new favicon.
    document.head.appendChild(favicon);
  }
});
