import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { compile } from '../utils/swr/fetchers';
import { Editor } from '../components/table-editor.tsx';

let lastStateHash;

const Form = () => {
  const router = useRouter();
  const { id, url, access_token } = router.query;
  const [ state, setState ] = useState({});
  let recompile = false;

  useEffect(() => {
    // Set recompile to true on first render.
    recompile = true;
  }, []);

  const stateHash = JSON.stringify(state);
  if (stateHash !== lastStateHash) {
    // The state of the form has changed, so recompile.
    recompile = true;
    lastStateHash = stateHash;
  }
  const resp = useSWR(
    access_token && id && url && state && {
      access_token,
      url,
      id,
      data: state,
    },
    compile
  );

  // // If isLoading, then data = state.
  const data = {
    ...state,
    ...resp.data?.data,
  };
  return (
    <Editor data={data} />
  );
}

export default Form;
