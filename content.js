chrome.runtime.onMessage.addListener(function (message) {
  if (message.action) {
    if (message.action === 'applyMatch') {
      applyMatch(message.data);
    }
  }
});

const findExistingFavIcon = function () {
  console.log('findExistingFavIcon', arguments);
  // Set a default to pass back.
  var favIconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEVFSYuu6K2kgAAAMxJREFUOMu9UssOgjAQnK0PYvw35M4Nvwmu6IJ8oikm7HpQkFIeQRMn2WS3mU5mugV+BLVNURQ6RYrj+AjAvvkbY8zDIzGzWmu9yrJMmVlF5CAiOxHZ9e+ZthF5GbC27qpFGJ7AXNwBNAB0VEBVZ7NGUYTrlZt+bADYfhwIAAIReU9UVbfuJM8vj77IdslBkpyduSxLzDhwUde1MwdB4PEcASLASTDcOWFeYPA1RjEUMHMRVgksrXGK50UgWudgsEbCfh9860CRphn+jifEvoLrs8T+3wAAAABJRU5ErkJggg==';

  // Find an existing favicon to use as the URL.
  links = document.head.getElementsByTagName("link");
  for (i = 0; i < links.length; i++) {
    if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {
      favIconUrl = links[i].href;
    }
  }
};

const appendNewFavIcon = function (favIconUrl) {
  console.log('appendNewFavIcon', arguments);
  // Create a new favicon link.
  var favicon = document.createElement("link");
  favicon.setAttribute("rel", "icon");
  favicon.type = "image/x-icon";
  favicon.href = favIconUrl;

  // Remove existing favicon links.
  links = document.head.getElementsByTagName("link");
  for (i = 0; i < links.length; i++) {
    if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {
      document.head.removeChild(links[i]);
    }
  }

  // Append the new favicon.
  document.head.appendChild(favicon);
};

/**
 * Build out the canvas only after the favicon loads.
 */
const imageLoadCallback = function (holder, evt) {
  console.log('imageLoadCallback', evt);
  // Transpose the icon into a canvas.
  const ext = evt.ext;
  const canvas = document.createElement("canvas");
  canvas.width = holder.width;
  canvas.height = holder.height;
  const context = canvas.getContext("2d");
  context.drawImage(holder, 0, 0);

  // Draw the effect based on the user dropdown.
  context.fillStyle = ext.bgcolor;

  switch (ext.orientation) {
    case 'right':
      context.fillRect(Math.floor(canvas.width * 0.75), 0, Math.floor(canvas.width / 4), canvas.height);
      break;
    case 'bottom':
      context.fillRect(0, Math.floor(canvas.height * 0.75), canvas.width, Math.floor(canvas.height / 4));
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

  const updatedFavIconUrl = canvas.toDataURL();
  appendNewFavIcon(updatedFavIconUrl);
};

const applyMatch = function (evt) {
  console.log('applyMatch', arguments);
  const existingFavIconUrl = evt.favIconUrl || findExistingFavIcon();
  const holder = document.createElement("img");

  holder.addEventListener("load", function () {
    imageLoadCallback(holder, evt);
  });
  holder.src = existingFavIconUrl;
};
