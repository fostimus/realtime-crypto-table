# Real Time Crypto Table

This real time crypto table pulls data from the CoinGecko API. Since the API is JSON, there was no way to set up more the performant Server Sent Events or Web Sockets that would be better choices.

Instead, I set up HTTP polling by requesting new data every second. This is configurable, and if we truly want more real time data then taking out the `renderToggle` will make the React app infinitely re-render. The data will get to us in more "real time", but will be much heavier in resource usage.

## Styling

I used TailwindCSS to style - it is easily customizable, and very quick style markup. I kept the UI overall simple, and chose a neutral/lighter font for an easier feel. When you sort a column, the header styles change to indicate which column you chose.

## To Do's

-   Custom sort method: current string version of money and coin (because of JSX markup) values is throwing off correct ordering
-   Some visualization of data changing - not easily able to tell the data changes in real time
