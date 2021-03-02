import { useMemo, useEffect, useState } from "react";
import { useTable } from "react-table";
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

  // note: styling can only support up to 12 columns. to add more, need to add to tailwind.config.js
  const coinFields = [
    {
      Header: "Coin (symbol)",
      accessor: "col1"
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
  ];

  const columns = useMemo(() => coinFields, []);

  const data = useMemo(
    () =>
      cryptoData.map(coin => ({
        col1: `${coin.name} (${coin.symbol})`,
        col2: coin.current_price,
        col3: `$${new Intl.NumberFormat().format(coin.ath)}`,
        col4: daysSince(coin.ath_date),
        col5: `$${new Intl.NumberFormat().format(coin.market_cap)}`,
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

  const tdStyles = `w-1/${coinFields.length}`;
  const trStyles = `border-b border-grey-300`;

  return (
    <>
      <table className="mx-auto text-center" {...getTableProps()}>
        <thead>
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <tr className={trStyles} {...headerGroup.getHeaderGroupProps()}>
              {// Loop over the headers in each row
              headerGroup.headers.map(column => (
                // Apply the header cell props
                <th className={`${tdStyles} h-12`} {...column.getHeaderProps()}>
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
