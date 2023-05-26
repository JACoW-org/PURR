import React, { useEffect, useState } from 'react';
import { Modal, Button, Icon } from 'semantic-ui-react';
import { concatMap, forkJoin, of, throwError } from 'rxjs';
import { fetchJson, openSocket, runPhase } from '../purr.lib';
import Logger from './purr.fp.logger';

const FinalProcPanel = ({ open, setOpen, settings }) => {
  const [prePressProcessing, setPrePressProcessing] = useState(false);
  const [finalProcProcessing, setFinalProcProcessing] = useState(false);
  const [aborting, setAborting] = useState(() => false);
  const [ops, setOps] = useState(() => []);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (prePressProcessing || finalProcProcessing) {

      const method = finalProcProcessing ? 'event_fp' : 'event_pp'

      // empty logs
      setLogs([]);

      // references to open web socket
      const [task_id, socket] = openSocket(settings);

      // actions
      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.text) {
            setOps(prevOps => [
              ...prevOps.map(o => ({ icon: "check", text: o.text })),
              { last: true, icon: 'spinner', text: `${body.params.text}` }
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

          setOps(prevOps => [
            ...prevOps.map(o => ({ icon: "check", text: o.text }))
          ]);

          if (body?.params?.event_path) {
            // downloadByUrl(new URL(`${body?.params?.event_path}.7z`, `${settings.api_url}`));
          }
        },
      };

      // subscription to the socket
      socket.subscribe({
        next: ({ head, body }) => runPhase(head, body, actions, socket),
        complete: () => setPrePressProcessing(false),
        error: err => {
          console.error(err);
          // TODO based on the error, build a map of error messages to display
          // setErrorMessage('Error while generating final proceedings.');
          // setShowError(true);
          setPrePressProcessing(false);
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
    }

    return () => { };
  }, [prePressProcessing, finalProcProcessing]);


  useEffect(() => {
    if (aborting) {
      console.log('Aborting...not implemented yet');
      setAborting(false);
    }
  }, [aborting]);


  return (
    <Modal open={open}>
      <Modal.Header>Generating final proceedings</Modal.Header>
      <Modal.Content>
        <div style={{ display: 'flex', gap: '1em' }}>
          <div style={{ width: '40%', position: 'sticky', top: 0 }}>
            {ops.length > 0 ? ops.map((op, key) =>
              <div key={key}>
                <Icon loading={!!op.last} name={op.icon} />
                <span>{op.text}</span>
              </div>) : <span>Ready</span>
            }
          </div>
          <div style={{ width: '60%' }}>
            <Logger logs={logs} />
          </div>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {prePressProcessing || finalProcProcessing ? (
              <Button negative onClick={() => setAborting(true)}>
                Abort
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>Close</Button>
            )}
          </div>
          <div>
            <Button
              disabled={finalProcProcessing}
              loading={prePressProcessing}
              onClick={() => setPrePressProcessing(true)}
            >
              Pre press
            </Button>
            <Button
              primary
              disabled={prePressProcessing}
              loading={finalProcProcessing}
              onClick={() => setFinalProcProcessing(true)}
            >
              Final Proceedings
            </Button>
          </div>
        </div>
      </Modal.Actions>
    </Modal>
  );
};

export default FinalProcPanel;
