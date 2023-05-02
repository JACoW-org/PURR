import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';
import {of, forkJoin, throwError} from 'rxjs';
import {concatMap} from 'rxjs/operators';

import {download, openSocket, fetchJson, runPhase} from './purr.lib';

export const PurrAbstractBooklet = ({settings, settingsValid}) => {
  const [loading, setLoading] = useState(() => false);

  const onDownload = useCallback(() => setLoading(true), []);

  useEffect(() => {
    if (settings && loading) {
      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => console.log(head, body),
        'task:result': (head, body) => download(body),
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
                method: `event_ab`,
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
