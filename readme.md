Simple visualisation example for pulling data from [ThingSpeak](https://thingspeak.com/docs) and plotting using [NVD3](http://nvd3.org/).

## How it works?
When you load up index.html, it will first load some CSS files, which tell it how it should look (what colours, fonts, etc.)
It will also load up the appropriate scripts, including some from the internet (underscore, D3, NVD3), and the local script for this particular example ([./assets/js/app.js](./assets/js/app.js)).

Check out app.js, it's easiest to read from the bottom up. The `setInterval()` function tells the page to keep running `update()` every `interval` milliseconds.
Next `$.getJSON` makes an ajax request to thinkspeak, and will as the name suggests gets JSON. `handleData` will take the raw thinkspeak data and parse it into a suitable format for `nvd3` (our chart library), then parsed to `redraw` just inserts on the page.
