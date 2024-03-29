import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react';
import { of, forkJoin, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { download, openSocket, fetchJson, runPhase } from './purr.lib';
import { PurrErrorAlert } from './purr.error.alert';

export const PurrAbstractBooklet = ({ settings, settingsValid, processing, setProcessing }) => {
  const [loading, setLoading] = useState(() => false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);

  const onDownload = useCallback(() => setLoading(true), []);

  useEffect(() => {
    setProcessing(loading);
    return () => { };
  }, [loading]);

  useEffect(() => {
    if (settings && loading) {
      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => console.log(head, body),
        'task:result': (head, body) => download(body),
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

      socket.subscribe({
        next: ({ head, body }) => runPhase(head, body, actions, socket),
        complete: () => setLoading(false),
        error: err => {
          console.error(err);
          setErrorMessage('Error while generating the abstract booklet.');
          setShowError(true);
          setLoading(false);
        },
      });

      const context = { params: {} };

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'),
            })
          ),

          concatMap(({ event }) => {
            if (event.error) {
              return throwError(() => new Error('error'));
            }

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
                method: `event_abstract_booklet`,
                params: context.params,
              },
            });

            return of(null);
          })
        )
        .subscribe();
    }

    return () => { };
  }, [settings, loading]);

  return (
    <>
      <Card fluid>
        <Card.Content>
          <Card.Header>Abstract Booklet</Card.Header>
          <Card.Meta>Click "Download" button to download the Abstract Booklet document.</Card.Meta>
        </Card.Content>

        <Card.Content extra>
          <div className="ui left">
            {loading ? (
              <div>
                <Icon loading name="spinner" />
                Processing...
              </div>
            ) : (
              <div>
                <Icon name="plug" />
                Ready.
              </div>
            )}
          </div>
          <div className="ui right">
            <Button.Group size='mini'>
              <Button
                onClick={onDownload}
                loading={loading}
                disabled={processing || !settingsValid}
                primary
                compact
                size="mini"
                labelPosition="right"
                icon="cloud download"
                content="Download"
              />
            </Button.Group>
          </div>
        </Card.Content>
      </Card>
      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
    </>
  );
};
