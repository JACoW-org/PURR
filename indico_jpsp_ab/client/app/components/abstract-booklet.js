// Component name
export const name = 'jpsp-abstract-booklet'

// Runs once on creation
export function setup(_props) {

    this.ulid = ULID();

    const ws = this.websocket = new WebSocket(`ws://127.0.0.1:8000/socket/jpsp:feed`);

    ws.addEventListener('open', (ev) => {

        console.log('onopen', ev)

        ws.addEventListener("message", ({ data }) => {
            const event = JSON.parse(data);
            console.log(event)
        });

    });

    this.downloading = false;
    this.checking = false;
    this.label = 'Download Abstract Booklet';
    this.description = 'You can attach files or links using the buttons on the right.';
}

// Return then component template
export function render() {
    return `
        <div class="action-box fixed-width">
            <div class="section">
                <span class="icon icon-file-download"></span>
                <div class="text">
                    <div class="label"><%= label %></div>
                    <div class="description"><%= description %></div>
                </div>
                <div class="toolbar">
                    <% if (downloading) { %>
                        <jpsp-download-progress class="progress"></jpsp-download-progress>
                    <% } else { %>
                        <jpsp-download-button class="download"></jpsp-download-button>
                    <% } %>

                    <% if (checking) { %>
                        <jpsp-download-progress class="progress"></jpsp-download-progress>
                    <% } else { %>
                        <jpsp-check-button class="check"></jpsp-check-button>
                    <% } %>
                </div>
            </div>
        </div>
    `
}

// Runs after body update
export function run(_props) {

    const ws = this.websocket;

    this._on('.download', 'download', () => {

        setTimeout(() => {

            const start = new Date().getTime();

            Promise.resolve()
                .then(() => console.log('>>> download'))
                .then(() => this.downloading = true)
                .then(() => fetchEventJson())
                .then((evt) => createEventAb(evt))
                .then((dat) => {
                    const a = document.createElement("a");
                    a.href = window.URL.createObjectURL(dat);
                    a.download = "ab.odt";
                    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                    a.click();
                    a.remove(); //afterwards we remove the element again
                })
                .catch((err) => console.error(err))
                .finally(() => {
                    this.downloading = false
                    const end = new Date().getTime();
                    console.log('duration: ', (end - start))
                })
            
        })

    });

    this._on('.check', 'check', () => {

        setTimeout(() => {

            const start = new Date().getTime();

            Promise.resolve()
                .then(() => console.log('>>> check'))
                .then(() => this.checking = true)
                .then(() => fetchEventFilesJson())
                .then((params) => {
                    params.contributions.forEach(contribution => {
                        ws.send(JSON.stringify({
                            head: {
                                code: 'exec_task',
                                uuid: this.ulid(),
                                time: `${new Date().getTime()}`
                            },
                            body: {
                                method: 'check_pdf',
                                params: {
                                    contributions: [contribution]
                                }
                            },
                        }));
                    });
                })
                .then((dat) => {
                    console.log(dat)
                })
                .catch((err) => console.error(err))
                .finally(() => {
                    this.checking = false
                    const end = new Date().getTime();
                    console.log('duration: ', (end - start));
                })

            })

    })
}


function fetchEventJson() {
    console.log('[INDICO-PLUGIN] >>> fetchEventJson')

    const url = `event-json`;

    const opts = {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: undefined, // body data type must match "Content-Type" header
    };

    return fetch(url, opts).then((res) => res.json());
}

function fetchEventFilesJson() {
    console.log('[INDICO-PLUGIN] >>> fetchEventFilesJson')

    const url = `event-files-json`;

    const opts = {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: undefined, // body data type must match "Content-Type" header
    };

    return fetch(url, opts).then((res) => res.json());
}

function fetchEventFilesReport(params) {
    console.log('[JPSP-NG] >>> fetchEventFilesReport')

    const url = `http://127.0.0.1:8000/api/event-pdf-check`;

    const opts = {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(params), // body data type must match "Content-Type" header
    };

    return fetch(url, opts).then((res) => res.json()); 
}

function createEventAb(req) {
    console.log('[JPSP-NG] >>> createEventAb')

    const url = `http://127.0.0.1:8000/api/generate-event-ab.odt`;

    const opts = {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(req), // body data type must match "Content-Type" header
    };

    return fetch(url, opts).then((res) => res.blob());
}



function ULID() {
    const BASE32 = [
        '0', '1', '2', '3', '4', '5', '6', '7',
        '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q',
        'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
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
            dest[i * 8 + 3] = BASE32[(ulid[i * 5 + 1] << 2 | ulid[i * 5 + 2] >> 6) & 0x1f];
            dest[i * 8 + 4] = BASE32[(ulid[i * 5 + 2] >> 1) & 0x1f];
            dest[i * 8 + 5] = BASE32[(ulid[i * 5 + 2] << 4 | ulid[i * 5 + 3] >> 4) & 0x1f];
            dest[i * 8 + 6] = BASE32[(ulid[i * 5 + 3] << 1 | ulid[i * 5 + 4] >> 7) & 0x1f];
            dest[i * 8 + 7] = BASE32[(ulid[i * 5 + 4] >> 2) & 0x1f];
            dest[i * 8 + 8] = BASE32[(ulid[i * 5 + 4] << 3 | ulid[i * 5 + 5] >> 5) & 0x1f];
            dest[i * 8 + 9] = BASE32[(ulid[i * 5 + 5] >> 0) & 0x1f];
        }
        return dest.join('');
    }

    return function () {
        let now = Date.now();
        if (now === last) {
            /* 80-bit overflow is so incredibly unlikely that it's not
             * considered as a possiblity here.
             */
            for (let i = 9; i >= 0; i--)
                if (rand[i]++ < 255)
                    break;
        } else {
            last = now;
            time.setUint16(0, (now / 4294967296.0) | 0);
            time.setUint32(2, now | 0);
            window.crypto.getRandomValues(rand);
        }
        return encode(ulid);
    };
}