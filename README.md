# Real Time Crypto Table

This real time crypto table pulls data from the CoinGecko API. Since the API is JSON, there was no way to set up more the performant Server Sent Events or Web Sockets that would be better choices.

Instead, I set up HTTP polling by requesting new data every second. This is configurable, and if we truly want more real time data then taking out the `renderToggle` will make the React app infinitely re-render. The data will get to us in more "real time", but will be much heavier in resource usage.

## To Do's

- custom sort method: current string version of money values is throwing off numeric ordering
