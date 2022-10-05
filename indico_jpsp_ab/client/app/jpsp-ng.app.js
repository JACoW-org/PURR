import createComponent from './create-component'

import * as AbstractBooklet from './components/abstract-booklet'
import * as CheckButton from './components/check-button'
import * as DownloadButton from './components/download-button'
import * as DownloadProgress from './components/download-progress'

createComponent(AbstractBooklet)
createComponent(CheckButton)
createComponent(DownloadButton)
createComponent(DownloadProgress)

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#jpsp-app').innerHTML = 
        `<jpsp-abstract-booklet></jpsp-abstract-booklet>`;

});

