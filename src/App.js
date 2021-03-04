import { useMemo, useEffect, useState } from "react";
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
  const [sortBy, setSortBy] = useState([]);
  const [rowState, setRowState] = useState([]);

  const amountOfCoins = 100;

  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${amountOfCoins}&page=1&sparkline=false`
      )
      .then(response => {
        const totalMarketShare = response.data.reduce(
          (acc, coin) => acc + coin.market_cap,
          0
        );

        const rows = response.data.map((coin, index) => ({
          col0: (
            <div className="flex items-center justify-start gap-3">
              <img
                src={coin.image}
                alt={`${coin.name}-logo`}
                height={logoSize}
                width={logoSize}
              />
              {coin.name} ({coin.symbol})
            </div>
          ),
          col1: formatMoney(coin.current_price),
          col2: formatMoney(coin.ath),
          col3: daysSince(coin.ath_date),
          col4: formatMoney(coin.market_cap),
          col5: `${((coin.market_cap / totalMarketShare) * 100).toFixed(3)}%`
        }));

        setRowState(rows);

        // re-render state to get updated data from coingecko, doing this render evrery second instead of infinitely
        setTimeout(() => setRenderToggle(!renderToggle), 1000);
      });
  }, [renderToggle]);

  // note: styling can only support up to 12 columns. to add more, need to add to tailwind.config.js
  const columns = useMemo(
    () =>
      coinFields.map((col, index) => ({
        Header: col,
        accessor: `col${index}`
      })),
    [coinFields]
  );

  const logoSize = 25;

  const data = useMemo(() => rowState, [rowState]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      columns,
      data,
      // control state to have sort persist across real time calls
      useControlledState: state => {
        return useMemo(
          () => ({
            ...state,
            sortBy: sortBy
          }),
          [state]
        );
      }
    },
    useSortBy
  );

  /****** Event handlers ********/
  function clickHeader(column) {
    const curIdx = coinFields.indexOf(column);
    const curCol = `col${curIdx}`;

    if (sortBy && sortBy.length > 0 && sortBy[0].id === curCol) {
      if (sortBy[0].desc) {
        //Descending - switch to no sort
        setSortBy([]);
      } else {
        //Ascending - switch to descending
        setSortBy([{ id: curCol, desc: true }]);
      }
    } else {
      //No sort - switch to descending
      setSortBy([{ id: curCol, desc: false }]);
    }
  }

  /****** styles ******/
  const tdStyles = `py-4 px-14 md:px-4 w-1/${coinFields.length}`;
  const trStyles = `border-b border-grey-300`;

  return (
    <div className="md:mx-10 md:mb-10 relative top-4">
      <h1 className="text-center underline text-2xl my-4">
        Real Time Top 100 Cryptocurrencies
      </h1>
      <table
        className="mx-auto text-center text-sm md:text-base"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map(headerGroup => (
            <tr className={trStyles} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => (
                <th
                  className={`${tdStyles} h-12`}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  onClick={() => clickHeader(column.render("Header"))}
                >
                  <div>
                    {column.render("Header")}
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
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr
                className={`${trStyles} hover:bg-gray-200`}
                {...row.getRowProps()}
              >
                {row.cells.map(cell => {
                  return (
                    <td
                      className={tdStyles}
                      onChange={() =>
                        console.log(cell.render("Cell"), "I changed!")
                      }
                      {...cell.getCellProps()}
                    >
                      {cell.render("Cell")}
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

/********** Helpers ************/

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
