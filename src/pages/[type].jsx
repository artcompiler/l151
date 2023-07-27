import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as d3 from 'd3';
import useSWR from 'swr';
import { compile } from '../utils/swr/fetchers';

function isNonNullObject(obj) {
  return (typeof obj === "object" && obj !== null);
}

const editIcon =
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>


const plusIcon =
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>


const tabs = [
  { name: 'Shipping', href: '#', current: false },
  { name: 'Items', href: '#', current: true },
  { name: 'Prices', href: '#', current: false },
  { name: 'Playground', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Tabs({ currentTab, setTab }) {
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          defaultValue={tabs[currentTab].name}
          onChange={(e) => {
            setTab(tabs.findIndex(tab => tab.name === e.target.value || 0));
          }}
        >
          {tabs.map(tab => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <a
                key={index}
                href={tab.href}
                className={classNames(
                  currentTab === index
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={tab.current ? 'page' : undefined}
                onClick={() => setTab(index)}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

function renderAttr(attr) {
  Object.keys(attr).forEach(key => {
    if (key.indexOf('on') === 0) {
      attr[key] = new Function('e', attr[key]);
    }
  });
  return attr;
}

let ticket = 1;

function renderJSON(data, depth = 0) {
  const x = depth * 15;
  if (Array.isArray(data)) {
    const elts = data.map(dat => {
      const val = renderJSON(dat, depth + 1);
      return <tspan key={ticket++} x={x + 15} dy="1rem">{val}</tspan>
    });
    return (
      <>
        <tspan key={ticket++} x={x} dy="1rem">[</tspan>
        {elts}
        <tspan key={ticket++} x={x} dy="1rem">]</tspan>
      </>
    );
  } else if (isNonNullObject(data)) {
    const keys = Object.keys(data);
    const elts = keys.map(key => {
      const val = renderJSON(data[key], depth + 1);
      return <tspan key={ticket++} x={x + 15} dy="1rem">{key}: {val}</tspan>
    });
    return (
      <>
        <tspan key={ticket++} x={x} dy="1rem">{"{"}</tspan>
        {elts}
        <tspan key={ticket++} x={x} dy="1rem">{"}"}</tspan>
      </>
    );
  } else {
    return data;
  }
}

function render(data) {
  const elts = renderJSON(data);
  return <text key={ticket++} x="5" y="15" fontFamily="monospace">{elts}</text>;
}

function Table({ table_name, row_name, desc, cols, rows }) {
  return (
    <div className="pt-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          { /*<h1 className="text-base font-semibold leading-6 text-gray-900">
            {table_name}
            </h1> */
          }
          <p className="mt-2 text-sm text-gray-700">
            { desc }
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {
                    cols.map((col, index) => (
                      <th key={index} scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-0">
                        {col}
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {
                  rows.map((row, index) => (
                    <tr key={index}>
                      {
                        cols.map((col, index) => (
                          <td key={index} className="whitespace-nowrap py-2 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-0">
                            {row[col]}
                          </td>
                        ))
                      }
                      <td className="relative pl-0 pr-4">
                        <a href="#" className="text-gray-600 hover:text-gray-900">
                          <svg width="16" height="18">
                            {editIcon}
                          </svg>
                          <span className="sr-only">Edit {row_name}</span>
                        </a>
                      </td>
                    </tr>
                  ))
                }
                <tr className="mt-4 sm:mt-0 w-full">
                  <td className="py-4 pl-0">
                    <button type="button" title={`Add ${row_name}`}>
                      { plusIcon }
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const PricesForm = ({ setState, isLoading, data }) => {
  const { prices } = data;
  if (prices === undefined) {
    return <div />;
  }
  const { table_name, row_name, desc, cols, rows } = prices;
  return (
    <div key={ticket++} id="graffiti" className="">
      <Table table_name={table_name} row_name={row_name} desc={desc} cols={cols} rows={rows} />
    </div>
  );
}

const ItemsForm = ({ setState, isLoading, data }) => {
  const { items } = data;
  if (items === undefined) {
    return <div />;
  }
  const { table_name, row_name, desc, cols, rows } = items;
  return (
    <div key={ticket++} id="graffiti" className="">
      <Table table_name={table_name} row_name={row_name} desc={desc} cols={cols} rows={rows} />
    </div>
  );
}

const ShippingForm = ({ setState, isLoading, data }) => {
  const { shipping } = data;
  if (shipping === undefined) {
    return <div />;
  }
  const { table_name, row_name, desc, cols, rows } = shipping;
  return (
    <div key={ticket++} id="graffiti" className="">
      <Table table_name={table_name} row_name={row_name} desc={desc} cols={cols} rows={rows} />
    </div>
  );
}

let lastStateHash;
const Form = () => {
  const router = useRouter();
  const { id, url, access_token } = router.query;
  const [ tab, setTab] = useState(1);
  const [ state, setState] = useState({});
  let recompile = true; // FIXME
  const stateHash = JSON.stringify(state);
  if (stateHash !== lastStateHash) {
    // The state of the form has changed, so recompile.
    recompile = true;
    lastStateHash = stateHash;
  }
  const resp = useSWR(
    recompile && access_token && id && url && state && {
      access_token,
      url,
      id,
      data: state,
    },
    compile
  );

  const isLoading = resp.isLoading;
  // If isLoading, then 'state' is still current.
  const data = {
    ...state,
    ...resp.data?.data,
  };
  let elts;
  switch (tab) {
  case 0:
    elts = ShippingForm({ setState, isLoading, data });
    break;
  case 1:
    elts = ItemsForm({ setState, isLoading, data });
    break;
  case 2:
    elts = PricesForm({ setState, isLoading, data });
    break;
  default:
    elts = ShippingForm({ setState, isLoading, data });
    break;
  }
  return (
    <div id="graffiti" className="flex flex-col max-w-2xl sm:px-6 lg:px-8">
      <Tabs currentTab={tab} setTab={setTab} />
      { elts }
    </div>
  );
}

export default Form;
