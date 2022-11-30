// import createComponent from './create-component'
//
// import * as AbstractBooklet from './components/abstract-booklet'
// import * as CheckButton from './components/check-button'
// import * as DownloadButton from './components/download-button'
// import * as DownloadProgress from './components/download-progress'
//
// createComponent(AbstractBooklet)
// createComponent(CheckButton)
// createComponent(DownloadButton)
// createComponent(DownloadProgress)
//
// document.addEventListener('DOMContentLoaded', () => {
//
//     document.querySelector('#jpsp-app').innerHTML =
//         `<jpsp-abstract-booklet></jpsp-abstract-booklet>`;
//
// });




// import { createApp as c } from 'vue'
// 
// import RootComponent from './jpsp-ng.root.js'
// 
// import SettingsBox from './components/jpsp-ng.settings.js'
// import DownloadBox from './components/jpsp-ng.download.js'
// import ReportBox from './components/jpsp-ng.report.js'


document.addEventListener("DOMContentLoaded", () => {

    // c(RootComponent)
    // 
    //     .component('SettingsBox', SettingsBox)
    //     .component('DownloadBox', DownloadBox)
    //     .component('ReportBox', ReportBox)
    // 
    //     .mount('#app')

})

function get_settings() {
    try {
        return JSON.parse(
            document.querySelector('#jpsp-ng-settings').textContent
        );
    } catch (e) {
        return undefined;
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const jpsp_ng_settings = get_settings();

    if (!jpsp_ng_settings) { return; }

    const jpsp_ng_element = document.querySelector(".jpsp-ng");

    if (!jpsp_ng_element) { return; }

    const ulid = ULID();

    const ws = (settings => {

        //console.log(settings);

        const store = {};

        // const handlers = {
        //     // check_pdf: ({ head, body }) => { console.log({ head, body }) },
        //     // event_ab: ({ head, body }) => console.log({ head, body })
        // };        

        const api_url = new URL(settings.api_url);
        const api_pro = 'https:' === api_url.protocol ? 'wss:' : 'ws:';

        document.cookie = `X-API-KEY=${settings.api_key}` + "; path=/";

        const ws = new WebSocket(`${api_pro}//${api_url.host}/socket/jpsp:feed`);

        ws.addEventListener("open", (ev) => {
            document
                .querySelectorAll(".jpsp")
                .forEach((e) => (e.style.visibility = "visible"));

            ws.addEventListener("message", ({ data }) => {
                const { head, body } = JSON.parse(data);

                log_data({ head, body });

                run_handler({ head, body });
            });
        });

        ws.task = ({ pre, post, progress, err, task }) => {
            const uuid = ulid();
            const time = new Date().getTime();

            store[uuid] = {
                insert_time: time,
            };

            if (post) {
                store[uuid].post = post;
            }

            if (progress) {
                store[uuid].progress = progress;
            }

            Promise.resolve()
                .then(() => pre())

                .then(() => task.params())
                .then((params) => {
                    ws.send(
                        JSON.stringify({
                            head: {
                                code: "task:exec",
                                uuid: uuid,
                                time: time,
                            },
                            body: {
                                method: task.method,
                                params: params
                            },
                        })
                    );
                })

                .catch((e) => err(e));
            // .finally(() => post())
        };

        return ws;

        function run_handler({ head, body }) {
            if (head.code === "task:progress") {
                if (head.uuid in store) {
                    if ("progress" in store[head.uuid]) {
                        store[head.uuid].progress.call(null, { head, body });
                    }
                }
            }

            if (head.code === "task:end") {
                if (head.uuid in store) {
                    if ("post" in store[head.uuid]) {
                        store[head.uuid].post.call(null, { head, body });
                    }
                }
            }

            // if (body.method in handlers) {
            //     handlers[body.method].call(null, { head, body });
            // }
        }

        function log_data({ head, body }) {
            if (head) store[head.uuid] = store[head.uuid] || {};

            if (["task:queued"].includes(head.code)) {
                store[head.uuid].queued_time = head.time;
            } else if (["task:begin"].includes(head.code)) {
                store[head.uuid].begin_time = head.time;
            } else if (["task:end", "task:error"].includes(head.code)) {
                store[head.uuid].end_time = head.time;

                console.log(
                    `[${head.uuid}]`,
                    "queued -> end",
                    store[head.uuid].end_time - store[head.uuid].queued_time,
                    "seconds"
                );

                console.log(
                    `[${head.uuid}]`,
                    "begin -> end",
                    store[head.uuid].end_time - store[head.uuid].begin_time,
                    "seconds"
                );

                console.log(
                    `[${head.uuid}]`,
                    "queued -> begin",
                    store[head.uuid].begin_time - store[head.uuid].queued_time,
                    "seconds"
                );
            }
        }
    })(jpsp_ng_settings);

    document.querySelector(".download").addEventListener("click", (ev) => {
        const loader = createLoader("Downloading...");

        ws.task({
            pre: () => {
                ev.target.classList.add("disabled");
                ev.target.appendChild(loader);
            },
            progress: ({ head, body }) => {
                ev.target.classList.remove("disabled");
                ev.target.removeChild(loader);

                const url = "data:application/octet-stream;base64," + body.params.b64;

                // const blob = b64toBlob(body.params.b64, "application/octet-stream");
                // const url = URL.createObjectURL(blob);

                console.log('url', url)

                Promise.resolve().then(() => {
                    console.log('assign >>>')
                    return Object.assign(document.createElement("a"), {
                        href: url,
                        download: body.params.filename,
                        style: 'display:none'
                    })
                }).then(a => {
                    console.log('append >>>')
                    return document.body.appendChild(a)
                }).then(a => {
                    return new Promise(ok => {
                        a.onclick = () => {

                            setTimeout(() => {

                                console.log('onclick >>>', );

                                if (!document.hasFocus()) {
                                    window.addEventListener('focus', () => {
                                        return ok(a);
                                    }, { once: true });
                                } else {
                                    return ok(a);
                                }                                

                            }, 1500)

                        };
                        console.log('click >>>')
                        a.dispatchEvent(new MouseEvent('click'));
                    });
                }).then(a => {
                    console.log('remove >>>')
                    a.remove();
                }).then(a => {
                    window.URL.revokeObjectURL(url);
                    console.log('end >>>')
                })

            },
            err: (e) => console.error(e),
            task: {
                method: "event_ab",
                params: () => fetchEventJson(),
            },
        });

        // Promise.resolve()
        //     .then(() => {
        //         ev.target.classList.add('disabled');
        //         ev.target.appendChild(loader)
        //     })
        //     .then(() => fetchEventJson())
        //     // .then((evt) => createEventAb(evt))
        //     .then((params) => {
        //         ws.send(JSON.stringify({
        //             head: {
        //                 code: 'task:exec',
        //                 uuid: ulid(),
        //                 time: `${new Date().getTime()}`
        //             },
        //             body: {
        //                 method: 'event_ab',
        //                 params: params
        //             },
        //         }));
        //     })
        //     .catch((err) => console.error(err))
        //     .finally(() => {
        //         ev.target.classList.remove('disabled');
        //         ev.target.removeChild(loader);
        //     })

        // fetch(`http://${location.host}/api/conference/44/get`)
        //     .then(res => res.json())
        //     .then(json => console.log(json))
        //     .catch(err => console.error(err))
    });

    document.querySelector(".clear").addEventListener("click", (ev) => {
        const files_box = jpsp_ng_element.querySelector(".files-box");
        files_box
            .querySelectorAll(".section.section-added")
            .forEach((el) => el.parentNode.removeChild(el));
        files_box.style.display = 'none';
    });

    document.querySelector(".check").addEventListener("click", (ev) => {
        const loader = createLoader("Checking...");

        const files_box = jpsp_ng_element.querySelector(".files-box");
        files_box
            .querySelectorAll(".section.section-added")
            .forEach((el) => el.parentNode.removeChild(el));

        files_box.style.display = 'block';

        const progress = Object.assign(document.createElement("section"), {
            className: "section section-added",
            innerHTML: `<div class="meter"><span class="progress"></span></div>`,
            update: ({ index, total }) => {
                const el = progress.querySelector(".meter .progress");

                if (total === 0) {
                    el.style.width = "100%";
                } else {
                    el.style.width = (index * 100) / total + "%";
                }
            },
            increment: ({ total }) => {
                progress.dataset.total = total;
                progress.dataset.index = progress.dataset.index || 0;
                progress.dataset.index++;
                progress.querySelector(".meter .progress").style.width =
                    (progress.dataset.index * 100) / total + "%";
            },
        });

        ws.task({
            pre: () => {
                ev.target.classList.add("disabled");
                ev.target.appendChild(loader);
                files_box.appendChild(progress);

                progress.update({
                    index: 0,
                    total: 0,
                });
            },
            progress: ({ head, body }) => {
                if (body.params.progress) {
                    progress.increment({
                        total: body.params.progress.total,
                    });

                    console.log(
                        body.params.progress.index,
                        body.params.progress.total,
                        body.params.progress.file.filename
                    );

                    files_box.appendChild(
                        Object.assign(document.createElement("section"), {
                            className: "section section-added",
                            innerHTML: `
                                <div class="text">
                                    <div class="jpsp-row">
                                        <div class="jpsp-col jpsp-col-grow">
                                            <span class="icon icon-small icon-file-pdf"></span>
                                            <span class="label">File:</span> 
                                            ${body.params.progress.file.filename}
                                        </div>
                                        <div class="jpsp-col jpsp-col-grow">
                                            <span class="label">Fonts:</span>
                                            <span class="icon icon-small icon-checkbox-checked"></span>
                                        </div>
                                        <div class="jpsp-col jpsp-col-grow">
                                            <span class="label">Page Size:</span>
                                            <span class="icon icon-small icon-checkbox-checked"></span>
                                        </div>
                                        <div class="jpsp-col">
                                            <a href="/${body.params.progress.file.contribution_url}/editing/paper">Go</a>
                                        </div>
                                    <div>
                                </div>`,
                        })
                    );
                }
            },
            post: () => {
                ev.target.classList.remove("disabled");
                ev.target.removeChild(loader);
                files_box.removeChild(progress);
            },
            err: (e) => console.error(e),
            task: {
                method: "check_pdf",
                params: () => fetchEventFilesJson(),
            },
        });

        // Promise.resolve()
        //     .then(() => {
        //         ev.target.classList.add('disabled');
        //         ev.target.appendChild(loader)
        //     })
        //     .then(() => fetchEventFilesJson())
        //     .then((params) => {
        //         ws.send(JSON.stringify({
        //             head: {
        //                 code: 'task:exec',
        //                 uuid: ulid(),
        //                 time: `${new Date().getTime()}`
        //             },
        //             body: {
        //                 method: 'check_pdf',
        //                 params: params
        //             },
        //         }));
        //
        //         // params.contributions.forEach(contribution => {
        //         //
        //         // });
        //     })
        //     .catch((err) => console.error(err))
        //     .finally(() => {
        //         ev.target.classList.remove('disabled');
        //         ev.target.removeChild(loader);
        //     })
    });
});

async function fetchEventJson() {
    console.log("[INDICO-PLUGIN] >>> fetchEventJson");

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

    const res = await fetch(url, opts);
    return await res.json();
}

async function fetchEventFilesJson() {
    console.log("[INDICO-PLUGIN] >>> fetchEventFilesJson");

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

    const res = await fetch(url, opts);
    return await res.json();
}

async function fetchEventFilesReport(params) {
    console.log("[JPSP-NG] >>> fetchEventFilesReport");

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

    const res = await fetch(url, opts);
    return await res.json();
}

async function createEventAb(req) {
    console.log("[JPSP-NG] >>> createEventAb");

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

    const res = await fetch(url, opts);
    return await res.blob();
}

function createLoader(label) {
    return Object.assign(document.createElement("span"), {
        innerHTML: SVGLoader(label),
        className: "jpsp-loader",
    });
}

function SVGLoader(label) {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:.5em" width="19px" height="19px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><defs><clipPath id="ldio-nrdo6xh3vun-cp" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="28"></circle></clipPath></defs><circle cx="50" cy="50" r="37" fill="#fac090" stroke="#ff7c81" stroke-width="6"></circle><g clip-path="url(#ldio-nrdo6xh3vun-cp)"><g><g transform="scale(0.5)"><g transform="translate(-50,-50)"><path fill="#ffffcb" d="M71.989,44.694V8.711c0-0.419-0.34-0.759-0.759-0.759H28.769c-0.419,0-0.759,0.34-0.759,0.759v35.983H6.069 c-0.914,0-1.405,1.075-0.807,1.766l43.931,45.22c0.425,0.491,1.188,0.491,1.613,0l43.931-45.22c0.599-0.691,0.108-1.766-0.807-1.766 H71.989z"></path></g></g><animateTransform attributeName="transform" type="translate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="50 -20;50 120"></animateTransform></g></g></svg>${label}`;
}

function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function ULID() {
    const BASE32 = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "J",
        "K",
        "M",
        "N",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "V",
        "W",
        "X",
        "Y",
        "Z",
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
            dest[i * 8 + 3] =
                BASE32[((ulid[i * 5 + 1] << 2) | (ulid[i * 5 + 2] >> 6)) & 0x1f];
            dest[i * 8 + 4] = BASE32[(ulid[i * 5 + 2] >> 1) & 0x1f];
            dest[i * 8 + 5] =
                BASE32[((ulid[i * 5 + 2] << 4) | (ulid[i * 5 + 3] >> 4)) & 0x1f];
            dest[i * 8 + 6] =
                BASE32[((ulid[i * 5 + 3] << 1) | (ulid[i * 5 + 4] >> 7)) & 0x1f];
            dest[i * 8 + 7] = BASE32[(ulid[i * 5 + 4] >> 2) & 0x1f];
            dest[i * 8 + 8] =
                BASE32[((ulid[i * 5 + 4] << 3) | (ulid[i * 5 + 5] >> 5)) & 0x1f];
            dest[i * 8 + 9] = BASE32[(ulid[i * 5 + 5] >> 0) & 0x1f];
        }
        return dest.join("");
    }

    return function () {
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
