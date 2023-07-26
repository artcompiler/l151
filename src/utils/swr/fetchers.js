import bent from "bent";

export const compile = async ({ id, url, data, access_token }) => {
  id = id.split("+").slice(0, 2).join("+");  // Re-compile state with code id.
  const baseUrl = url.slice(0, url.indexOf("/data?"));
  const headers = {
    authorization: access_token,
    "x-graffiticode-storage-type": "persistent",    
  };
  console.log("compile() baseUrl=" + baseUrl);
  const post = bent(baseUrl, "POST", "json", headers);
  const body = { id, data };
  const resp = await post('/compile', body);
  return resp;
};
