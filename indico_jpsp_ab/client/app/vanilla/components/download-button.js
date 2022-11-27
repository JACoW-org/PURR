// Component name
export const name = 'jpsp-download-button'

// Runs once on creation
export function setup() {}

// Runs on body update
export function render() {
    return `
        <a href="#"
            class="download i-button icon-file-openoffice"
            data-title="Download Abstract Booklet"
            data-qtip-oldtitle="Download Abstract Booklet">
                Download
        </a>
    `
}

// Runs after body update
export function run() {
    this._find('.download').onclick =
        () => this._elem.dispatchEvent(
            new CustomEvent('download', { detail: {} })
        );
}
