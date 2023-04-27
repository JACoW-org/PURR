import './purr.spa'

// document.addEventListener('DOMContentLoaded', () => {
//   const purr_settings = getSettings();

//   if (!purr_settings) {
//     return;
//   }

//   const purr_element = document.querySelector('.purr');

//   if (!purr_element) {
//     return;
//   }

//   const store = {};

//   const tasks = new Subject();

//   const ws = (settings => {
//     //console.log(settings);

//     const api_url = new URL(settings.api_url);
//     const api_pro = 'https:' === api_url.protocol ? 'wss:' : 'ws:';
//     const api_key = settings.api_key;

//     const base_url = `${api_pro}//${api_url.host}/socket/${api_key}`;

//     const socket = task_id => {
//       return new Promise((ok, ko) => {
//         const ws = new WebSocket(`${base_url}/${task_id}`);

//         ws.addEventListener('open', ev => {
//           ws.addEventListener('message', ({data}) => {
//             const {head, body} = JSON.parse(data);

//             log_data({head, body, store});

//             run_handler({head, body, store});
//           });

//           return ok(ws);
//         });
//       });
//     };

//     const task = ({pre, params, post, result, progress, err, method}) => {
//       const uuid = ulid();

//       store[uuid] = {insert_time: new Date().getTime(), method, uuid};

//       if (pre) {
//         store[uuid].pre = pre;
//       }

//       if (params) {
//         store[uuid].params = params;
//       }

//       if (post) {
//         store[uuid].post = post;
//       }

//       if (result) {
//         store[uuid].result = result;
//       }

//       if (progress) {
//         store[uuid].progress = progress;
//       }

//       if (err) {
//         store[uuid].err = err;
//       }

//       tasks.next(uuid);
//     };

//     return {socket, task};
//   })(purr_settings);

//   tasks
//     .asObservable()
//     .pipe(
//       concatMap(task_id => {
//         if (!task_id) {
//           return;
//         }

//         const {insert_time, pre, params, err, method} = store[task_id];

//         return of(
//           Promise.all([pre(), params(), ws.socket(task_id)])
//             .then(results => {
//               store[task_id].ws = results[2];

//               store[task_id].ws.send(
//                 JSON.stringify({
//                   head: {
//                     code: 'task:exec',
//                     uuid: task_id,
//                     time: insert_time,
//                   },
//                   body: {
//                     method: method,
//                     params: results[1],
//                   },
//                 })
//               );
//             })
//             .catch(e => err(e))
//         );
//       })
//     )
//     .subscribe();

//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   /////////////// ABSTRACT BOOKLET //////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////

//   document.querySelector('.download').addEventListener('click', ev => {
//     const loader = createLoader('Downloading...');

//     ws.task({
//       pre: () => {
//         ev.target.classList.add('disabled');
//         ev.target.appendChild(loader);
//       },
//       result: ({head, body}) => {
//         ev.target.classList.remove('disabled');
//         loader.remove();
//         download(body);
//       },
//       err: e => console.error(e),
//       params: () => fetchAbstractBookletJson(false),
//       method: 'event_ab',
//     });
//   });

//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   /////////////// PAPERS REFERENCE //////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////

//   document.querySelector('.reference').addEventListener('click', ev => {
//     const loader = createLoader('Downloading...');

//     ws.task({
//       pre: () => {
//         ev.target.classList.add('disabled');
//         ev.target.appendChild(loader);
//       },
//       progress: ({head, body}) => {
//         console.log(body?.params);
//       },
//       result: ({head, body}) => {
//         console.log(body?.params);
//         ev.target.classList.remove('disabled');
//         loader.remove();
//       },
//       err: e => console.error(e),
//       params: () => fetchAbstractBookletJson(false),
//       method: 'event_ref',
//     });
//   });

//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   /////////////// FINAL PROCEEDINGS//////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////

//   document.querySelector('.clear-proceedings').addEventListener('click', ev => {
//     const proceedings_box = purr_element.querySelector('.proceedings-box');
//     proceedings_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));
//       proceedings_box.style.display = 'none';
//   });

//   document.querySelector('.proceedings').addEventListener('click', ev => {
//     const loader = createLoader('Proceedings...');

//     const proceedings_box = purr_element.querySelector('.proceedings-box');
//     proceedings_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));

//     proceedings_box.style.display = 'block';

//     const progress = Object.assign(document.createElement('section'), {
//       className: 'section section-added',
//       innerHTML: `<div class="meter"><span class="progress"></span></div>`,
//       update: ({index, total}) => {
//         const el = progress.querySelector('.meter .progress');

//         if (total === 0) {
//           el.style.width = '100%';
//         } else {
//           el.style.width = (index * 100) / total + '%';
//         }
//       },
//       increment: ({total}) => {
//         progress.dataset.total = total;
//         progress.dataset.index = progress.dataset.index || 0;
//         progress.dataset.index++;
//         progress.querySelector('.meter .progress').style.width =
//           (progress.dataset.index * 100) / total + '%';
//       },
//     });

//     ws.task({
//       pre: () => {
//         ev.target.classList.add('disabled');
//         ev.target.appendChild(loader);
//         proceedings_box.appendChild(progress);
//         progress.update({index: 0, total: 0});
//       },
//       progress: ({head, body}) => {
//         console.log('progress:', body.params.phase)
//         progress.increment({total: 14});

//         proceedings_box.appendChild(
//           Object.assign(document.createElement('section'), {
//             className: 'section section-added',
//             innerHTML: `
//               <div class="text">
//                   <div class="purr-row">
//                       <div class="purr-col purr-col-grow">
//                           <span class="icon icon-small icon-eye"></span>
//                           <span class="label">Phase:</span>
//                           ${body.params.phase}
//                       </div>
//                       <div class="purr-col purr-col-grow">
//                           ${body.params.text}
//                       </div>
//                   <div>
//               </div>`,
//           })
//         );

//       },
//       result: ({head, body}) => {
//         ev.target.classList.remove('disabled');
//         loader.remove();
//         download(body);
//       },
//       post: () => {
//         ev.target.classList.remove('disabled');
//         loader.remove();
//         proceedings_box.removeChild(progress);
//       },
//       err: e => console.error(e),
//       params: () => fetchFinalProceedingsJson(true),
//       method: 'event_zip',
//     });
//   });

//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   /////////////// PAPERS KEYWORDS ///////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////

//   document.querySelector('.clear-keywords').addEventListener('click', ev => {
//     const keywords_box = purr_element.querySelector('.keywords-box');
//     keywords_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));
//     keywords_box.style.display = 'none';
//   });

//   document.querySelector('.keywords').addEventListener('click', ev => {
//     const loader = createLoader('Keywords...');

//     const keywords_box = purr_element.querySelector('.keywords-box');
//     keywords_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));

//     keywords_box.style.display = 'block';

//     const progress = Object.assign(document.createElement('section'), {
//       className: 'section section-added',
//       innerHTML: `<div class="meter"><span class="progress"></span></div>`,
//       update: ({index, total}) => {
//         const el = progress.querySelector('.meter .progress');

//         if (total === 0) {
//           el.style.width = '100%';
//         } else {
//           el.style.width = (index * 100) / total + '%';
//         }
//       },
//       increment: ({total}) => {
//         progress.dataset.total = total;
//         progress.dataset.index = progress.dataset.index || 0;
//         progress.dataset.index++;
//         progress.querySelector('.meter .progress').style.width =
//           (progress.dataset.index * 100) / total + '%';
//       },
//     });

//     ws.task({
//       pre: () => {
//         ev.target.classList.add('disabled');
//         ev.target.appendChild(loader);
//         keywords_box.appendChild(progress);
//         progress.update({index: 0, total: 0});
//       },
//       progress: ({head, body}) => {
//         progress.increment({total: body.params.total});

//         // console.log(body.params.index, body.params.total, body.params.file.filename);

//         keywords_box.appendChild(
//           Object.assign(document.createElement('section'), {
//             className: 'section section-added',
//             innerHTML: `
//               <div class="text">
//                   <div class="purr-row">
//                       <div class="purr-col purr-col">
//                           <span class="icon icon-small icon-file-pdf"></span>
//                           <span class="label">File:</span> 
//                           ${body.params.file.filename}
//                       </div>
//                       <div class="purr-col purr-col-grow">
//                           <span class="label">Keywords:</span>
//                           ${JSON.stringify(body.params.keywords)}
//                       </div>
//                   <div>
//               </div>`,
//           })
//         );
//       },
//       post: () => {
//         ev.target.classList.remove('disabled');
//         loader.remove();
//         keywords_box.removeChild(progress);
//       },
//       err: e => console.error(e),
//       params: () => fetchFinalProceedingsJson(true),
//       method: 'event_pdf',
//     });
//   });

//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   /////////////// PAPERS CHECKS /////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////
//   ///////////////////////////////////////////////////////////////////////

//   document.querySelector('.clear-checks').addEventListener('click', ev => {
//     const files_box = purr_element.querySelector('.files-box');
//     files_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));
//     files_box.style.display = 'none';
//   });

//   document.querySelector('.checks').addEventListener('click', ev => {
//     const loader = createLoader('Checking...');

//     const files_box = purr_element.querySelector('.files-box');
//     files_box
//       .querySelectorAll('.section.section-added')
//       .forEach(el => el.parentNode.removeChild(el));

//     files_box.style.display = 'block';

//     const progress = Object.assign(document.createElement('section'), {
//       className: 'section section-added',
//       innerHTML: `<div class="meter"><span class="progress"></span></div>`,
//       update: ({index, total}) => {
//         const el = progress.querySelector('.meter .progress');

//         if (total === 0) {
//           el.style.width = '100%';
//         } else {
//           el.style.width = (index * 100) / total + '%';
//         }
//       },
//       increment: ({total}) => {
//         progress.dataset.total = total;
//         progress.dataset.index = progress.dataset.index || 0;
//         progress.dataset.index++;
//         progress.querySelector('.meter .progress').style.width =
//           (progress.dataset.index * 100) / total + '%';
//       },
//     });

//     ws.task({
//       pre: () => {
//         ev.target.classList.add('disabled');
//         ev.target.appendChild(loader);
//         files_box.appendChild(progress);
//         progress.update({index: 0, total: 0});
//       },
//       progress: ({head, body}) => {
//         progress.increment({total: body.params.total});

//         // console.log(body.params.index, body.params.total, body.params.file.filename);

//         const filename = body.params.file.filename;
//         const event_id = body.params.file.event_id;
//         const contribution_id = body.params.file.contribution_id;

//         // f"event/{event.id}/contributions/{contribution.id}"
//         const contribution_url = `event/${event_id}/contributions/${contribution_id}`;
//         const edit_url = `/${contribution_url}/editing/paper`;

//         files_box.appendChild(
//           Object.assign(document.createElement('section'), {
//             className: 'section section-added',
//             innerHTML: `
//               <div class="text">
//                   <div class="purr-row">
//                       <div class="purr-col purr-col-grow">
//                           <span class="icon icon-small icon-file-pdf"></span>
//                           <span class="label">File:</span> 
//                           ${filename}
//                       </div>
//                       <div class="purr-col purr-col-grow">
//                           <span class="label">Fonts:</span>
//                           <span class="icon icon-small icon-checkbox-checked"></span>
//                       </div>
//                       <div class="purr-col purr-col-grow">
//                           <span class="label">Page Size:</span>
//                           <span class="icon icon-small icon-checkbox-checked"></span>
//                       </div>
//                       <div class="purr-col">
//                           <a href="${edit_url}">Go</a>
//                       </div>
//                   <div>
//               </div>`,
//           })
//         );
//       },
//       post: () => {
//         ev.target.classList.remove('disabled');
//         loader.remove();
//         files_box.removeChild(progress);
//       },
//       err: e => console.error(e),
//       params: () => fetchFinalProceedingsJson(true),
//       method: 'check_pdf',
//     });
//   });
// });
