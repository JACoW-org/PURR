import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';
import {of, forkJoin, throwError} from 'rxjs';
import {concatMap} from 'rxjs/operators';

import {downloadByUrl, openSocket, fetchJson, runPhase} from './purr.lib';

export const PurrFinalProceedings = ({settings, settingsValid}) => {
  const [loading, setLoading] = useState(() => false);
  const [progress, setProgress] = useState(() => 'Processing...');

  const onDownload = useCallback(() => setLoading(true), []);

  useEffect(() => {
    if (settings && loading) {
      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => {
          if (body?.params?.text) {
            console.log(body.params.text);
            setProgress(`${body.params.text}`);
          }
        },
        'task:result': (head, body) => {
          console.log(head, body);

          if (body?.params?.event_path) {
            downloadByUrl(new URL(`${body?.params?.event_path}.7z`, `${settings.api_url}`));
          }
        },
      };

      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => setLoading(false),
        error: err => {
          console.error(err);
          setLoading(false);
        },
      });

      const context = {params: {}};

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'),
            })
          ),

          concatMap(({event}) => {
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
                method: `event_zip`,
                params: context.params,
              },
            });

            return of(null);
          })
        )
        .subscribe();
    }

    return () => {};
  }, [settings, loading]);

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>Final Proceedings</Card.Header>
        <Card.Meta>Click "Generate" button to download Final Proceedings</Card.Meta>
      </Card.Content>

      <Card.Content extra>
        <div className="ui left">
          {loading ? (
            <div>
              <Icon loading name="spinner" />
              {progress}
            </div>
          ) : (
            <div>
              <Icon name="plug" />
              Ready.
            </div>
          )}
        </div>
        <div className="ui right">
          <Button
            onClick={onDownload}
            loading={loading}
            disabled={loading || !settingsValid}
            primary
            compact
            size="mini"
            icon="right chevron"
            content="Download"
          />
        </div>
      </Card.Content>
    </Card>
  );
};
