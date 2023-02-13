// Component name
export const name = 'jpsp-check-button'

// Runs once on creation
export function setup() {}

// Runs on body update
export function render() {
    return `
        <a href="#"
            class="check i-button icon-file-openoffice"
            data-title="Check PDF Files"
            data-qtip-oldtitle="Check PDF Files">
                Check
        </a>
    `
}

// Runs after body update
export function run() {
    this._find('.check').onclick =
        () => this._elem.dispatchEvent(
            new CustomEvent('check', { detail: {} })
        );
}
