// Component name
export const name = 'jpsp-download-progress'

// Runs once on creation
export function setup() {}

// Runs on body update
export function render() {
    return `
        <a href="#"
            class="jpsp-btn i-button"
            data-title="Download Abstract Booklet"
            data-qtip-oldtitle="Download Abstract Booklet">
            <svg xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    style="margin-right: 0.5em;"
                    width="19px"
                    height="19px"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid">
                <defs>
                <clipPath id="ldio-nrdo6xh3vun-cp" x="0" y="0" width="100" height="100">
                <circle cx="50" cy="50" r="28"></circle>
                </clipPath>
                </defs>
                <circle cx="50" cy="50" r="37" fill="#fac090" stroke="#ff7c81" stroke-width="6"></circle>
                <g clip-path="url(#ldio-nrdo6xh3vun-cp)">
                <g>
                <g transform="scale(0.5)">
                <g transform="translate(-50,-50)">
                <path fill="#ffffcb" d="M71.989,44.694V8.711c0-0.419-0.34-0.759-0.759-0.759H28.769c-0.419,0-0.759,0.34-0.759,0.759v35.983H6.069 c-0.914,0-1.405,1.075-0.807,1.766l43.931,45.22c0.425,0.491,1.188,0.491,1.613,0l43.931-45.22c0.599-0.691,0.108-1.766-0.807-1.766 H71.989z">
                </path>
                </g>
                </g>
                <animateTransform attributeName="transform" type="translate" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="50 -20;50 120"></animateTransform>
                </g>
                </g>
            </svg>
            Download
        </a>
    `
}

// Runs after body update
export function run() {
}
