import createComponent from './create-component'

import * as AbstractBooklet from './components/abstract-booklet'
import * as DownloadButton from './components/download-button'
import * as DownloadProgress from './components/download-progress'

createComponent(AbstractBooklet)
createComponent(DownloadButton)
createComponent(DownloadProgress)

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#jpsp-app').innerHTML = 
        `<jpsp-abstract-booklet></jpsp-abstract-booklet>`;

});





