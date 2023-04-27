export async function fetchAbstractBookletJson() {
  console.log('[INDICO-PLUGIN] >>> fetchEventAbstractBookletJson');

  const url = `event-abstract-booklet`;

  return await abstractFetchJson(url);
}

export async function fetchFinalProceedingsJson() {
  console.log('[INDICO-PLUGIN] >>> fetchFinalProceedingsJson');

  const url = `event-final-proceedings`;

  return await abstractFetchJson(url);
}

async function abstractFetchJson(url) {
  const opts = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: undefined, // body data type must match "Content-Type" header
  };

  const res = await fetch(url, opts);
  return await res.json();
}
