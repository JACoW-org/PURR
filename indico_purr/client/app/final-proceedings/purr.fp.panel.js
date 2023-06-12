import React, {useCallback, useEffect, useState} from 'react';
import {Modal, Button, Icon} from 'semantic-ui-react';
import {concatMap, forkJoin, of, throwError} from 'rxjs';
import {downloadByUrl, fetchJson, openSocket, runPhase} from '../purr.lib';
import Logger from './purr.fp.logger';
import { size } from 'lodash';

const FinalProcPanel = ({open, setOpen, info, settings}) => {
  const [processing, setProcessing] = useState(() => false);
  const [prePressProcessing, setPrePressProcessing] = useState(false);
  const [finalProcProcessing, setFinalProcProcessing] = useState(false);
  // const [aborting, setAborting] = useState(() => false);
  // const [socket, setSocket] = useState(() => undefined);
  const [ops, setOps] = useState(() => []);
  const [logs, setLogs] = useState(() => []);
  const [compressProceedings, setCompressProceedings] = useState(() => false);
  const [downloadProceedings, setDownloadProceedings] = useState(() => false);

  const onClose = useCallback(() => {
    // console.log('onClose', prePressProcessing, finalProcProcessing)

    if (prePressProcessing) {
      // console.log('onClose - prePressProcessing')
      setPrePressProcessing(false);
    }

    if (finalProcProcessing) {
      // console.log('onClose - finalProcProcessing')
      setFinalProcProcessing(false);
    }
  }, [prePressProcessing, finalProcProcessing]);

  const onCompressProceedings = useCallback(() => setCompressProceedings(true), []);
  const onDownloadProceedings = useCallback(() => setDownloadProceedings(true), []);

  useEffect(() => {
    setProcessing(prePressProcessing || finalProcProcessing || compressProceedings || downloadProceedings);
  }, [prePressProcessing, finalProcProcessing, compressProceedings, downloadProceedings])

  // open
  useEffect(() => {
    if (!open) {
      // clear ops
      setOps([]);
      // clear logs
      setLogs([]);
    }

    return () => {};
  }, [open]);

  useEffect(() => {
    let [task_id, socket] = [];

    if (prePressProcessing || finalProcProcessing) {
      const method = finalProcProcessing ? 'event_final_proceedings' : 'event_pre_press';

      // empty logs
      setLogs([]);

      // references to open web socket
      [task_id, socket] = openSocket(settings);

      // setSocket(socket)

      // actions
      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.text) {
            setOps(prevOps => [
              ...prevOps.map(o => ({icon: 'check', text: o.text})),
              {last: true, icon: 'spinner', text: `${body.params.text}`},
            ]);
          }
        },
        'task:log': (head, body) => {
          if (body?.params) {
            setLogs(prevLogs => [...prevLogs, body.params]);
          }
        },
        'task:result': (head, body) => {
          console.log(head, body);

          setOps(prevOps => [...prevOps.map(o => ({icon: 'check', text: o.text}))]);
        },
      };

      // subscription to the socket
      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => setPrePressProcessing(false),
        error: err => {
          console.error(err);
          // TODO based on the error, build a map of error messages to display
          // setErrorMessage('Error while generating final proceedings.');
          // setShowError(true);
          setPrePressProcessing(false);
        },
      });

      const context = {params: {}};

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'), // GET settings and data for final proceedings
            })
          ),

          concatMap(({event}) => {
            if (event.error) {
              return throwError(() => new Error('error'));
            }

            setOps([]);

            context.params = {
              ...context.params,
              event: event.result.event,
              cookies: event.result.cookies,
              settings: event.result.settings,
            };

            socket.next({
              head: {
                code: `task:exec`,
                uuid: task_id,
              },
              body: {
                method: method,
                params: context.params,
              },
            });

            return of(null);
          })
        )
        .subscribe();
    }

    return () => {
      if (socket) {
        socket.complete();

        setOps(prevOps => [...prevOps.map(o => ({icon: 'check', text: o.text}))]);
      }
    };
  }, [prePressProcessing, finalProcProcessing]);

  // compress proceedings
  useEffect(() => {
    if (compressProceedings) {
      const method = 'event_compress_proceedings';

      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.text) {
            setOps(prevOps => [
              ...prevOps.map(o => ({icon: 'check', text: o.text})),
              {last: true, icon: 'spinner', text: `${body.params.text}`},
            ]);
          }
        },
        'task:log': (head, body) => {
          if (body?.params) {
            setLogs(prevLogs => [...prevLogs, body.params]);
          }
        },
        'task:result': (head, body) => {
          console.log(head, body);

          setOps(prevOps => [...prevOps.map(o => ({icon: 'check', text: o.text}))]);
        },
      };

      // subscription to the socket
      const sub$ = socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => setCompressProceedings(false),
        error: err => {
          console.error(err);
          // TODO based on the error, build a map of error messages to display
          // setErrorMessage('Error while generating final proceedings.');
          // setShowError(true);
          setCompressProceedings(false);
        },
      });

      const context = {params: {}};

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'), // GET settings and data for final proceedings
            })
          ),

          concatMap(({event}) => {
            if (event.error) {
              return throwError(() => new Error('error'));
            }

            setOps([]);

            context.params = {
              ...context.params,
              event: event.result.event,
              cookies: event.result.cookies,
              settings: event.result.settings,
            };

            socket.next({
              head: {
                code: `task:exec`,
                uuid: task_id,
              },
              body: {
                method: method,
                params: context.params,
              },
            });

            return of(null);
          })
        )
        .subscribe();

      return () => {
        if (socket) {
          socket.complete();

          setOps(prevOps => [...prevOps.map(o => ({icon: 'check', text: o.text}))]);
        }
      };
    }
  }, [compressProceedings]);

  // download proceedings
  useEffect(() => {
    if (downloadProceedings && info?.event_id && settings?.api_url) {
      // download proceedings
      const url = new URL(`${info.event_id}.7z`, `${settings.api_url}`);
      downloadByUrl(url);
      setDownloadProceedings(false);
    }
  }, [downloadProceedings]);

  return (
    <Modal open={open} size='small' className='fp-panel'>
      <Modal.Header>Generating final proceedings</Modal.Header>
      <Modal.Content>
          <div className='operations'>
            <h3>Tasks</h3>
            {ops.length > 0 ? (
              ops.map((op, key) => (
                <div key={key}>
                  <Icon loading={!!op.last} name={op.icon} />
                  <span>{op.text}</span>
                </div>
              ))
            ) : (
              <span>Ready</span>
            )}
          </div>
          <div className='logs'>
          <h3>Logs</h3>
            <Logger logs={logs} />
          </div>
      </Modal.Content>
      <Modal.Actions>
          <div>
            {prePressProcessing || finalProcProcessing ? (
              <Button negative onClick={() => onClose()} size='mini'>
                Abort
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)} size='mini'>Close</Button>
            )}
          </div>
          <div>
            <Button
              primary
              disabled={processing}
              loading={prePressProcessing}
              onClick={() => setPrePressProcessing(true)}
              size="mini"
            >
              Pre press
            </Button>
            <Button
              primary
              disabled={processing}
              loading={finalProcProcessing}
              onClick={() => setFinalProcProcessing(true)}
              size="mini"
            >
              Final Proceedings
            </Button>
            <Button
              icon
              title="Compress final proceedings"
              onClick={onCompressProceedings}
              loading={compressProceedings}
              disabled={processing}
              primary
              size="mini"
            >
              <Icon name="compress" />
            </Button>
            <Button
              icon
              title="Download final proceedings' ZIP"
              onClick={onDownloadProceedings}
              disabled={processing}
              primary
              size="mini"
            >
              <Icon name="download" />
            </Button>
          </div>
      </Modal.Actions>
    </Modal>
  );
};

export default FinalProcPanel;
