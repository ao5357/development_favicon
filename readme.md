# Development Favicon

A chrome extension to add color effects to favicons based on URL regex match patterns. 

## Why

I make websites (for [Commercial Progression](http://www.commercialprogression.com/)), and I found myself
with tons of tabs open per project; my local development site, the staging server, maybe even production.
Each tab had the same favicon and often the same page title, so it wasn't possible at a glance to know
which tab was which without opening it.

This extension lets you target URLs with a regex match pattern (so `.*\.local.*` for my local environment) and
apply effects to the favicon. I've got my local with a green stripe across the top, the staging server with a
yellow one, and could set different production environments with different colors and effects.

Another idea would be to match and apply effects for different signed-in Google accounts, so I'd know which
Google Drive is open.

Stuff like that.

## How

It's written to be as asynchronous, event-driven, and resource-light as possible.

## Development

If you'd like to fix bugs, add features, improve performance, or otherwise contribute to the project, I'm very
open to pull requests.

### Install (unpacked)

To install the development version of the extension, either clone the repo or use the ZIP download. At chrome://extensions make sure to check the "Developer mode" checkbox in the upper right-hand corner. After that, there will be a button to load an unpacked extension. Click that and select the folder containing the extension. It should then be ready to go!

Thank you for your interest in Development Favicon!
