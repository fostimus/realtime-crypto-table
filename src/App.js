import { useMemo, useEffect, useState } from "react";
import { useTable } from "react-table";
import "./App.css";
import axios from "axios";

function App() {
  const [renderToggle, setRenderToggle] = useState(false);
  const [cryptoData, setCryptoData] = useState([]);
  // save as separate state for readability
  const [totalMarketShare, setTotalMarketShare] = useState(0);

  const amountOfCoins = 100;

  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${amountOfCoins}&page=1&sparkline=false`
      )
      .then(response => {
        console.log(response);
        setCryptoData(response.data);

        setTotalMarketShare(
          response.data.reduce((acc, coin) => acc + coin.market_cap, 0)
        );

        // re-render state to get updated data from coingecko
        setTimeout(() => setRenderToggle(!renderToggle), 1000);
      });
  }, [renderToggle]);

  const columns = useMemo(
    () => [
      {
        Header: "Coin (symbol)",
        accessor: "col1" // accessor is the "key" in the data
      },
      {
        Header: "Price",
        accessor: "col2"
      },
      {
        Header: "All Time High",
        accessor: "col3"
      },
      {
        Header: "Days Since ATH",
        accessor: "col4"
      },
      {
        Header: "Market Cap",
        accessor: "col5"
      },
      {
        Header: "Market Share",
        accessor: "col6"
      }
    ],
    []
  );

  const data = useMemo(
    () =>
      cryptoData.map(coin => ({
        col1: `${coin.name} (${coin.symbol})`,
        col2: coin.current_price,
        col3: `$${coin.ath}`,
        col4: daysSince(coin.ath_date),
        col5: coin.market_cap,
        col6: `${((coin.market_cap / totalMarketShare) * 100).toFixed(3)}%`
      })),
    [cryptoData, totalMarketShare]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data });

  // need:
  // - days SINCE all time high
  // - percentage of market share (for first 100 coins)
  console.log(cryptoData);
  // console.log(totalMarketShare);

  return (
    // apply the table props

    <>
      <table {...getTableProps()}>
        <thead>
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th {...column.getHeaderProps()}>
                  {// Render the header
                  column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row);
            return (
              // Apply the row props
              <tr {...row.getRowProps()}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td {...cell.getCellProps()}>
                      {// Render the cell contents
                      cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default App;

/********** Helper ************/

function daysSince(date) {
  if (typeof date == "string") {
    date = new Date(date);
  }

  const ONE_DAY = 1000 * 60 * 60 * 24;

  let diff = Date.now() - date;

  return Math.round(diff / ONE_DAY);
}
