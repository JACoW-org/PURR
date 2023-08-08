import React, {useCallback, useEffect, useState} from 'react';
import {Modal, Button, Icon, Progress} from 'semantic-ui-react';
import {catchError, concatMap, forkJoin, of, throwError} from 'rxjs';
import {downloadByUrl, fetchJson, openSocket, runPhase} from '../purr.lib';
import Logger from './purr.fp.logger';
import {PurrErrorAlert} from '../purr.error.alert';

const FinalProcPanel = ({open, setOpen, info, settings, eventTitle, fpInfo, setFPInfo}) => {
  const [processing, setProcessing] = useState(() => false);
  const [prePressProcessing, setPrePressProcessing] = useState(() => false);
  const [finalProcProcessing, setFinalProcProcessing] = useState(() => false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(() => 0);
  const [taskCount, setTaskCount] = useState(() => 0);

  const [ops, setOps] = useState(() => []);
  const [logs, setLogs] = useState(() => []);
  const [compressProceedings, setCompressProceedings] = useState(() => false);
  const [downloadProceedings, setDownloadProceedings] = useState(() => false);
  const [showError, setShowError] = useState(() => false);
  const [errorMessage, setErrorMessage] = useState(() => null);
  const [progressStatus, setProgressStatus] = useState(() => null); // 'success' || 'error' || 'active' || 'aborted'

  const onClose = useCallback(() => {
    setOpen(false);
    setLogs([]);
    setOps([]);
  }, []);

  const onAbort = useCallback(() => {
    setProgressStatus('aborted');
    setOps(tasks =>
      tasks.map(task => (task.running ? {...task, running: false, icon: 'close'} : task))
    );

    if (prePressProcessing) {
      setPrePressProcessing(false);
    }

    if (finalProcProcessing) {
      setFinalProcProcessing(false);
    }
  }, [prePressProcessing, finalProcProcessing]);

  const onCompressProceedings = useCallback(() => setCompressProceedings(true), []);
  const onDownloadProceedings = useCallback(() => setDownloadProceedings(true), []);

  const onVisitProceedings = useCallback(() => {
    const url = new URL(`${info?.event_id}`, `${settings?.api_url}`);
    window.open(url, '_blank');
  }, [info, settings]);

  useEffect(() => {
    setProcessing(
      prePressProcessing || finalProcProcessing || compressProceedings || downloadProceedings
    );

    return () => {};
  }, [prePressProcessing, finalProcProcessing, compressProceedings, downloadProceedings]);

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
      setProgressStatus('active');

      const method = finalProcProcessing ? 'event_final_proceedings' : 'event_pre_press';

      // empty logs
      setLogs([]);
      setOps([]);

      // references to open web socket
      [task_id, socket] = openSocket(settings);

      // actions
      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.phase === 'init_tasks_list') {
            setTaskCount(body?.params?.tasks.length);
            setOps(
              body?.params?.tasks.map(task => ({
                icon: '',
                text: task.text,
                code: task.code,
                running: false,
              }))
            );
          } else if (body?.params?.text) {
            setOps(ops => {
              const newTaskIndex = ops.findIndex(task => task.code === body.params.phase);
              if (newTaskIndex > -1) {
                ops[newTaskIndex].icon = 'spinner';
                ops[newTaskIndex].running = true;
                setCurrentTaskIndex(newTaskIndex);
                if (newTaskIndex > 0) {
                  ops[newTaskIndex - 1].icon = 'check';
                  ops[newTaskIndex - 1].running = false;
                }
              }
              return ops;
            });
          }
        },
        'task:log': (head, body) => {
          if (body?.params) {
            setLogs(prevLogs => [...prevLogs, body.params]);
          }
        },
        'task:result': (head, body) => {

          setOps(prevOps => {
            setCurrentTaskIndex(prevOps.length);
            return [...prevOps.map(o => ({...o, icon: 'check', running: false}))];
          });

          setProgressStatus('success');

          setFPInfo(prev => ({
            ...prev,
            final_proceedings: finalProcProcessing,
            pre_press: prePressProcessing,
            proceedings_archive: false,
            datacite_json: finalProcProcessing,
          }));
        },
        'task:error': (head, body) => {
          console.log(head, body);

          if (!body.params) {
            return;
          }

          const errorMessage = body.params.message;

          setErrorMessage(errorMessage);
          setShowError(true);
          setProgressStatus('error');

          return socket.complete(head);
        },
      };

      // subscription to the socket
      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => {
          setPrePressProcessing(false);
          setFinalProcProcessing(false);
          setProgressStatus(current => (current === 'active' ? 'error' : current));
        },
        error: err => {
          console.error(err);

          setErrorMessage('Failed to start task. Check connection with MEOW.');
          setShowError(true);

          setPrePressProcessing(false);
          setFinalProcProcessing(false);

          setProgressStatus('error');
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
          }),
          catchError(error => {
            console.log(error);

            setErrorMessage(
              'Failed to fetch settings and data for this event. Retry or contact an admin.'
            );
            setShowError(true);

            throw error;
          })
        )
        .subscribe();
    }

    return () => {
      if (socket) {
        socket.complete();

        // setOps(prevOps => [...prevOps.map(o => ({...o, icon: 'check', running: false}))]);
      }
    };
  }, [prePressProcessing, finalProcProcessing]);

  // compress proceedings
  useEffect(() => {
    if (compressProceedings) {
      setProgressStatus('active');

      const method = 'event_compress_proceedings';

      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.phase === 'init_tasks_list') {
            setTaskCount(body?.params?.tasks.length);
            setOps(
              body?.params?.tasks.map(task => ({
                icon: '',
                text: task.text,
                code: task.code,
                running: false,
              }))
            );
          } else if (body?.params?.text) {
            setOps(ops => {
              const newTaskIndex = ops.findIndex(task => task.code === body.params.phase);
              if (newTaskIndex > -1) {
                ops[newTaskIndex].icon = 'spinner';
                ops[newTaskIndex].running = true;
                setCurrentTaskIndex(newTaskIndex);
                if (newTaskIndex > 0) {
                  ops[newTaskIndex - 1].icon = 'check';
                  ops[newTaskIndex - 1].running = false;
                }
              }
              return ops;
            });
          }
        },
        'task:log': (head, body) => {
          if (body?.params) {
            setLogs(prevLogs => [...prevLogs, body.params]);
          }
        },
        'task:result': (head, body) => {
          console.log(head, body);

          setOps(prevOps => {
            setCurrentTaskIndex(prevOps.length);
            return [...prevOps.map(o => ({...o, icon: 'check', running: false}))];
          });

          setProgressStatus('success');
          setFPInfo(prev => ({...prev, proceedings_archive: true}));
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
          setProgressStatus('error');

          return socket.complete();
        },
      };

      // subscription to the socket
      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => {
          setCompressProceedings(false);
          setProgressStatus(current => (current === 'active' ? 'error' : current));
        },
        error: err => {
          console.error(err);

          setErrorMessage('Failed to start task. Check connection with MEOW.');
          setShowError(true);
          setCompressProceedings(false);
          setProgressStatus('error');
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

    return () => {};
  }, [downloadProceedings]);

  return (
    <Modal open={open} className="fp-panel">
      <Modal.Header>{eventTitle} - Final proceedings generation panel</Modal.Header>
      <Modal.Content>
        <div className="operations">
          <h3>Tasks</h3>
          {ops.length > 0 ? (
            ops.map((op, key) => (
              <div key={key} className={key > currentTaskIndex ? 'pending' : null}>
                <Icon loading={op.running} name={op.icon} />
                <span>{op.text}</span>
              </div>
            ))
          ) : (
            <span>-</span>
          )}
        </div>

        <div className="logs">
          <h3>Logs</h3>
          <Logger logs={logs} />
        </div>
      </Modal.Content>

      <Modal.Description>
        <div className="info">
          <Progress
            color="blue"
            disabled={!ops?.length}
            value={currentTaskIndex}
            total={taskCount}
            progress="ratio"
            active={progressStatus === 'active'}
            success={progressStatus === 'success'}
            error={progressStatus === 'error'}
            warning={progressStatus === 'aborted'}
          />
        </div>
      </Modal.Description>

      <Modal.Actions>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {compressProceedings || prePressProcessing || finalProcProcessing ? (
            <Button size="mini" negative onClick={onAbort}>
              Abort
            </Button>
          ) : (
            <Button size="mini" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
        <div>
          <Button.Group size="mini">
            <Button
              icon="compress"
              content="Compress"
              title="Compress final proceedings"
              onClick={onCompressProceedings}
              loading={compressProceedings}
              disabled={processing || !(fpInfo?.pre_press || fpInfo?.final_proceedings)}
              color="violet"
              size="mini"
            />
            <Button
              icon="download"
              content="Download"
              title="Download final proceedings' ZIP"
              onClick={onDownloadProceedings}
              disabled={processing || !fpInfo?.proceedings_archive}
              color="purple"
              size="mini"
            />
            <Button
              icon="external alternate"
              content="Open"
              title="Visit static website"
              onClick={onVisitProceedings}
              disabled={processing || !(fpInfo?.pre_press || fpInfo?.final_proceedings)}
              color="brown"
              size="mini"
            />
          </Button.Group>
        </div>
        <div>
          <Button.Group size="mini">
            <Button
              disabled={processing}
              loading={prePressProcessing}
              onClick={() => setPrePressProcessing(true)}
              icon="cog"
              content="Pre Press"
              labelPosition="left"
              className="pre-press-btn"
            />
            <Button.Or />
            <Button
              disabled={processing}
              loading={finalProcProcessing}
              onClick={() => setFinalProcProcessing(true)}
              icon="cogs"
              content="Final Proceedings"
              labelPosition="right"
              color="green"
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
