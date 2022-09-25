// Component name
export const name = 'jpsp-abstract-booklet'

// Runs once on creation
export function setup(_props) {
    this.downloading = false;
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
                </div>
            </div>
        </div>
    `
}

// Runs after body update
export function run(_props) {
    this._on('.download', 'download', () => Promise.resolve()
        .then(() => console.log('>>>'))
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
        .finally(() => this.downloading = false)
    )
}


function fetchEventJson() {
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

function createEventAb(event) {
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
        body: JSON.stringify(event), // body data type must match "Content-Type" header
    };

    return fetch(url, opts).then((res) => res.blob());
}