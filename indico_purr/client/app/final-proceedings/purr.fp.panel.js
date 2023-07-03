import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Icon, Progress } from 'semantic-ui-react';
import { catchError, concatMap, forkJoin, of, throwError } from 'rxjs';
import { downloadByUrl, fetchJson, openSocket, runPhase } from '../purr.lib';
import Logger from './purr.fp.logger';
import { PurrErrorAlert } from '../purr.error.alert';

const FinalProcPanel = ({ open, setOpen, info, settings, eventTitle }) => {
  const [processing, setProcessing] = useState(() => false);
  const [prePressProcessing, setPrePressProcessing] = useState(false);
  const [finalProcProcessing, setFinalProcProcessing] = useState(false);
  const [taskCount, setTaskCount] = useState(() => 0);
  // const [aborting, setAborting] = useState(() => false);
  // const [socket, setSocket] = useState(() => undefined);
  const [ops, setOps] = useState(() => []);
  const [logs, setLogs] = useState(() => []);
  const [compressProceedings, setCompressProceedings] = useState(() => false);
  const [downloadProceedings, setDownloadProceedings] = useState(() => false);
  const [showError, setShowError] = useState(() => false);
  const [errorMessage, setErrorMessage] = useState(() => null);

  const onClose = useCallback(() => {
    setOpen(false);
    setLogs([]);
    setOps([]);
  }, [])

  const onAbort = useCallback(() => {

    // console.log('onAbort', prePressProcessing, finalProcProcessing)

    if (prePressProcessing) {
      // console.log('onAbort - prePressProcessing')
      setPrePressProcessing(false);
    }

    if (finalProcProcessing) {
      // console.log('onAbort - finalProcProcessing')
      setFinalProcProcessing(false);
    }
  }, [prePressProcessing, finalProcProcessing]);

  const onCompressProceedings = useCallback(() => setCompressProceedings(true), []);
  const onDownloadProceedings = useCallback(() => setDownloadProceedings(true), []);

  const onVisitProceedings = useCallback(() => {
    const url = new URL(`${info?.event_id}`, `${settings?.api_url}`);
    window.open(url, '_blank');
  }, [info, settings]);

  // set task count based on the selected event
  useEffect(() => {

    if (compressProceedings) {
      setTaskCount(2);
    }

    if (prePressProcessing) {
      setTaskCount(17);
    }

    if (finalProcProcessing) {
      setTaskCount(19);
    }

    return () => { }

  }, [compressProceedings, prePressProcessing, finalProcProcessing])

  useEffect(() => {
    setProcessing(
      prePressProcessing || finalProcProcessing || compressProceedings || downloadProceedings
    );
  }, [prePressProcessing, finalProcProcessing, compressProceedings, downloadProceedings]);

  // open
  useEffect(() => {
    if (!open) {
      // clear ops
      setOps([]);
      // clear logs
      setLogs([]);
    }

    return () => { };
  }, [open]);

  useEffect(() => {
    let [task_id, socket] = [];

    if (prePressProcessing || finalProcProcessing) {

      const method = finalProcProcessing ? 'event_final_proceedings' : 'event_pre_press';

      // empty logs
      setLogs([]);
      setOps([]);

      // references to open web socket
      [task_id, socket] = openSocket(settings);

      // setSocket(socket)

      // actions
      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.text) {
            setOps(prevOps => [
              ...prevOps.map(o => ({ icon: 'check', text: o.text })),
              { last: true, icon: 'spinner', text: `${body.params.text}` },
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

          setOps(prevOps => [...prevOps.map(o => ({ icon: 'check', text: o.text }))]);
        },
        'task:error': (head, body) => {
          console.log(head, body);

          if (!body.params) {
            return;
          }

          const errorMessage = body.params.message;

          setErrorMessage(errorMessage);
          setShowError(true);

          return socket.complete();
        }
      };

      // subscription to the socket
      socket.subscribe({
        next: ({ head, body }) => runPhase(head, body, actions, socket),
        complete: () => {
          setPrePressProcessing(false);
          setFinalProcProcessing(false);
        },
        error: err => {
          console.error(err);
          
          setErrorMessage('Failed to start task. Check connection with MEOW.');
          setShowError(true);

          setPrePressProcessing(false);
          setFinalProcProcessing(false);
        },
      });

      const context = { params: {} };

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'), // GET settings and data for final proceedings
            })
          ),

          concatMap(({ event }) => {
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
          }),
          catchError(error => {
            console.log(error);

            setErrorMessage('Failed to fetch settings and data for this event. Retry or contact an admin.');
            setShowError(true);

            throw error;
          })
        )
        .subscribe();
    }

    return () => {
      if (socket) {
        socket.complete();

        setOps(prevOps => [...prevOps.map(o => ({ icon: 'check', text: o.text })), { text: '' }]);
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
              ...prevOps.map(o => ({ icon: 'check', text: o.text })),
              { last: true, icon: 'spinner', text: `${body.params.text}` },
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

          setOps(prevOps => [...prevOps.map(o => ({ icon: 'check', text: o.text }))]);
        },
        'task:error': (head, body) => {
          console.log(head, body);
  
          if (!body.params) {
            return;
          }
  
          const errorMessage = body.params.message;
  
          // show error message
          setErrorMessage(errorMessage);
          setShowError(true);
  
          return socket.complete();
        }
      };

      // subscription to the socket
      const sub$ = socket.subscribe({
        next: ({ head, body }) => runPhase(head, body, actions, socket),
        complete: () => setCompressProceedings(false),
        error: err => {
          console.error(err);
          // TODO based on the error, build a map of error messages to display
          // setErrorMessage('Error while generating final proceedings.');
          // setShowError(true);
          setCompressProceedings(false);
        },
      });

      const context = { params: {} };

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'), // GET settings and data for final proceedings
            })
          ),

          concatMap(({ event }) => {
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

          setOps(prevOps => [...prevOps.map(o => ({ icon: 'check', text: o.text })), { text: '' }]);
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
    <Modal open={open} className="fp-panel">
      <Modal.Header>{eventTitle} - Final proceedings generation panel</Modal.Header>
      <Modal.Content>

        <div className="operations">
          <h3>Tasks</h3>
          {ops.length > 0 ? (
            ops.map((op, key) => (
              <div key={key}>
                <Icon loading={!!op.last} name={op.icon} />
                <span>{op.text}</span>
              </div>
            ))
          ) : (<span>-</span>)}
        </div>

        <div className="logs">
          <h3>Logs</h3>
          <Logger logs={logs} />
        </div>
      </Modal.Content>

      <Modal.Description>
        <div className="info">
          <Progress color='blue' disabled={!ops?.length}
            value={ops?.length - 1} total={taskCount} progress='ratio' />
        </div>
      </Modal.Description>

      <Modal.Actions>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {compressProceedings || prePressProcessing || finalProcProcessing ? (
            <Button size="mini" negative onClick={onAbort}>
              Abort
            </Button>
          ) : (
            <Button size="mini" onClick={onClose}>Close</Button>
          )}
        </div>
        <div>
          <Button.Group size='mini'>
            <Button
              icon="compress"
              content="Compress"
              title="Compress final proceedings"
              onClick={onCompressProceedings}
              loading={compressProceedings}
              disabled={processing}
              color='violet'
              size="mini"
            />
            <Button
              icon="download"
              content="Download"
              title="Download final proceedings' ZIP"
              onClick={onDownloadProceedings}
              disabled={processing}
              color='purple'
              size="mini"
            />
            <Button
              icon="external alternate"
              content="Open"
              title="Visit static website"
              onClick={onVisitProceedings}
              disabled={processing}
              color='brown'
              size="mini"
            />
          </Button.Group>
        </div>
        <div>
          <Button.Group size='mini'>
            <Button
              disabled={processing}
              loading={prePressProcessing}
              onClick={() => setPrePressProcessing(true)}
              icon='cog'
              content='Pre Press'
              labelPosition='left'
              className='pre-press-btn'
            />
            <Button.Or />
            <Button
              disabled={processing}
              loading={finalProcProcessing}
              onClick={() => setFinalProcProcessing(true)}
              icon='cogs'
              content='Final Proceedings'
              labelPosition='right'
              color='green'
            />
          </Button.Group>

        </div>
      </Modal.Actions>

      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
    </Modal>
  );
};

export default FinalProcPanel;
