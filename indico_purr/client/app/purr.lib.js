export function get_settings() {
  try {
    return JSON.parse(document.querySelector('#purr-settings').textContent);
  } catch (e) {
    return undefined;
  }
}

export function createLoader(label) {
  return Object.assign(document.createElement('span'), {
    innerHTML: SVGLoader(label),
    className: 'purr-loader',
  });
}

function SVGLoader(label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:.5em" width="19px" height="19px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><defs><clipPath id="ldio-nrdo6xh3vun-cp" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="28"></circle></clipPath></defs><circle cx="50" cy="50" r="37" fill="#fac090" stroke="#ff7c81" stroke-width="6"></circle><g clip-path="url(#ldio-nrdo6xh3vun-cp)"><g><g transform="scale(0.5)"><g transform="translate(-50,-50)"><path fill="#ffffcb" d="M71.989,44.694V8.711c0-0.419-0.34-0.759-0.759-0.759H28.769c-0.419,0-0.759,0.34-0.759,0.759v35.983H6.069 c-0.914,0-1.405,1.075-0.807,1.766l43.931,45.22c0.425,0.491,1.188,0.491,1.613,0l43.931-45.22c0.599-0.691,0.108-1.766-0.807-1.766 H71.989z"></path></g></g><animateTransform attributeName="transform" type="translate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="50 -20;50 120"></animateTransform></g></g></svg>${label}`;
}

export function download(body) {
  const url = 'data:application/octet-stream;base64,' + body.params.b64;

  const a = document.body.appendChild(
    Object.assign(document.createElement('a'), {
      href: url,
      download: body.params.filename,
      style: 'display:none',
    })
  );

  a.dispatchEvent(new MouseEvent('click'));

  setTimeout(() => {
    a.remove();
    window.URL.revokeObjectURL(url);
  });
}


export function log_data({head, body, store}) {
  if (head) store[head.uuid] = store[head.uuid] || {};

  if (['task:queued'].includes(head.code)) {
    store[head.uuid].queued_time = head.time;
  } else if (['task:begin'].includes(head.code)) {
    store[head.uuid].begin_time = head.time;
  } else if (['task:result'].includes(head.code)) {
    store[head.uuid].result_time = head.time;
  } else if (['task:end', 'task:error'].includes(head.code)) {
    store[head.uuid].end_time = head.time;

    console.log(
      `[${head.uuid}]`,
      'queued -> end',
      store[head.uuid].end_time - store[head.uuid].queued_time,
      'seconds'
    );

    console.log(
      `[${head.uuid}]`,
      'begin -> end',
      store[head.uuid].end_time - store[head.uuid].begin_time,
      'seconds'
    );

    console.log(
      `[${head.uuid}]`,
      'queued -> begin',
      store[head.uuid].begin_time - store[head.uuid].queued_time,
      'seconds'
    );
  }
}

export function run_handler({head, body, store}) {
  if (head.code === 'task:progress') {
    if (head.uuid in store) {
      if ('progress' in store[head.uuid]) {
        store[head.uuid].progress.call(null, {head, body});
      }
    }
  }
  if (head.code === 'task:result') {
    if (head.uuid in store) {
      if ('result' in store[head.uuid]) {
        store[head.uuid].result.call(null, {head, body});
      }
    }
  }

  if (head.code === 'task:end') {
    if (head.uuid in store) {
      if ('post' in store[head.uuid]) {
        store[head.uuid].post.call(null, {head, body});
      }
      if ('ws' in store[head.uuid]) {
        store[head.uuid].ws.close();
      }
      delete store[head.uuid];
    }
  }
}

export function get_ulid() {
  const BASE32 = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'M',
    'N',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];
  let last = -1;
  /* Pre-allocate work buffers / views */
  let ulid = new Uint8Array(16);
  let time = new DataView(ulid.buffer, 0, 6);
  let rand = new Uint8Array(ulid.buffer, 6, 10);
  let dest = new Array(26);

  function encode(ulid) {
    dest[0] = BASE32[ulid[0] >> 5];
    dest[1] = BASE32[(ulid[0] >> 0) & 0x1f];
    for (let i = 0; i < 3; i++) {
      dest[i * 8 + 2] = BASE32[ulid[i * 5 + 1] >> 3];
      dest[i * 8 + 3] = BASE32[((ulid[i * 5 + 1] << 2) | (ulid[i * 5 + 2] >> 6)) & 0x1f];
      dest[i * 8 + 4] = BASE32[(ulid[i * 5 + 2] >> 1) & 0x1f];
      dest[i * 8 + 5] = BASE32[((ulid[i * 5 + 2] << 4) | (ulid[i * 5 + 3] >> 4)) & 0x1f];
      dest[i * 8 + 6] = BASE32[((ulid[i * 5 + 3] << 1) | (ulid[i * 5 + 4] >> 7)) & 0x1f];
      dest[i * 8 + 7] = BASE32[(ulid[i * 5 + 4] >> 2) & 0x1f];
      dest[i * 8 + 8] = BASE32[((ulid[i * 5 + 4] << 3) | (ulid[i * 5 + 5] >> 5)) & 0x1f];
      dest[i * 8 + 9] = BASE32[(ulid[i * 5 + 5] >> 0) & 0x1f];
    }
    return dest.join('');
  }

  return function() {
    let now = Date.now();
    if (now === last) {
      /* 80-bit overflow is so incredibly unlikely that it's not
       * considered as a possiblity here.
       */
      for (let i = 9; i >= 0; i--) if (rand[i]++ < 255) break;
    } else {
      last = now;
      time.setUint16(0, (now / 4294967296.0) | 0);
      time.setUint32(2, now | 0);
      window.crypto.getRandomValues(rand);
    }
    return encode(ulid);
  };
}
