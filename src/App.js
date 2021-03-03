import { useMemo, useEffect, useState, useRef } from "react";
import { useTable, useSortBy } from "react-table";
import axios from "axios";

function App() {
  /********* Constants ********/

  // columns
  const coinFields = useMemo(
    () => [
      "Coin (symbol)",
      "Price",
      "All Time High",
      "Days Since ATH",
      "Market Cap",
      "Market Share"
    ],
    []
  );

  const downArrow = " 🔽";
  const upArrow = " 🔼";

  /********* State *********/
  const [renderToggle, setRenderToggle] = useState(false);
  const [initialState, setInitialState] = useState({});
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
        response.data.map((coin, index) => ({
          col1: `${coin.name} (${coin.symbol})`,
          col2: formatMoney(coin.current_price),
          col3: formatMoney(coin.ath),
          col4: daysSince(coin.ath_date),
          col5: formatMoney(coin.market_cap),
          col6: `${((coin.market_cap / totalMarketShare) * 100).toFixed(3)}%`
        }));
        setCryptoData(response.data);

        setTotalMarketShare(
          response.data.reduce((acc, coin) => acc + coin.market_cap, 0)
        );

        // re-render state to get updated data from coingecko, doing this render evrery second instead of infinitely
        setTimeout(() => setRenderToggle(!renderToggle), 5000);
      });

    // prevCryptoRef.current = cryptoData;
  }, [renderToggle]);

  // note: styling can only support up to 12 columns. to add more, need to add to tailwind.config.js

  const columns = useMemo(
    () =>
      coinFields.map((col, index) => ({
        Header: col,
        accessor: `col${index + 1}`
      })),
    [coinFields]
  );

  const data = useMemo(
    () =>
      cryptoData.map((coin, index) => ({
        col1: `${coin.name} (${coin.symbol})`,
        col2: formatMoney(coin.current_price),
        col3: formatMoney(coin.ath),
        col4: daysSince(coin.ath_date),
        col5: formatMoney(coin.market_cap),
        col6: `${((coin.market_cap / totalMarketShare) * 100).toFixed(3)}%`
      })),
    [totalMarketShare, cryptoData]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({ columns, data, initialState }, useSortBy);

  /****** Event handlers *********/

  /****** styles ******/
  const tdStyles = `py-4 px-14 md:px-4 w-1/${coinFields.length}`;
  const trStyles = `border-b border-grey-300`;

  return (
    <div className="m-4">
      <h1 className="text-center underline text-2xl my-4">
        Real Time Top 100 Cryptocurrencies
      </h1>
      <table
        className="mx-auto text-center text-sm md:text-base"
        {...getTableProps()}
      >
        <thead>
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr className={trStyles} {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map((column, index) => (
                // Apply the header cell props
                <th
                  className={`${tdStyles} h-12`}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  <div>
                    {// Render the header
                    column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? downArrow
                          : upArrow
                        : ""}
                    </span>
                  </div>
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
              <tr
                className={`${trStyles} hover:bg-gray-200`}
                {...row.getRowProps()}
              >
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td className={tdStyles} {...cell.getCellProps()}>
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
    </div>
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

function formatMoney(amount) {
  let formattedAmount = `$${new Intl.NumberFormat().format(
    Math.round(amount * 100) / 100
  )}`;

  // if decimal and only one digit after decimal
  if (
    formattedAmount.includes(".") &&
    formattedAmount.indexOf(".") === formattedAmount.length - 2
  ) {
    formattedAmount = formattedAmount + "0";
  }

  return formattedAmount;
}
