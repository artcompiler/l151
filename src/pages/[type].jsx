import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
//import './style.css';

function renderAttr(attr) {
  Object.keys(attr).forEach(key => {
    if (key.indexOf('on') === 0) {
      attr[key] = new Function('e', attr[key]);
    }
  });
  return attr;
}

function render(data) {
  data = [].concat(data);
  const elts = [];
  let key = 1;
  data.forEach(d => {
    if (d === undefined) {
      return;
    }
    switch(d.type) {
    case 'b':
      elts.push(<b key={key++}>{render(d.elts)}</b>);
      break;
    default:
      elts.push(<text x="10" y="50">{d}</text>);
      break;
    }
  });
  return elts;
}

const Form = () => {
  const [ elts, setElts ] = useState([]);
  const router = useRouter();
  const { type, data } = router.query;
  useEffect(() => {
    if (data === undefined) {
      return;
    }
    const { url } = JSON.parse(data);
    console.log("Form() url=" + url);
    (async () => {
      const resp = await fetch(
        url,
        { headers: {'Content-Type': 'application/json'}}
      );
      const { data } = await resp.json();
      console.log("Form() data=" + JSON.stringify(data));
      if (data === undefined) {
        return;
      }
      try {
        setElts(render(data));
      } catch (x) {
        // Bad data.
        console.log("Bad data in query: " + x);
      }
    })();
  }, [data]);

  return (
    <div id="graffiti">
      <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet" />
      <svg width="100%" height="100">
        {elts}
      </svg>
    </div>
  );
}

export default Form;
