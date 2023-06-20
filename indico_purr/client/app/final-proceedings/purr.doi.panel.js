import React, {useCallback, useEffect, useState} from 'react';
import {Button, List, Modal, Progress} from 'semantic-ui-react';
import {fetchJson, openSocket, runPhase} from '../purr.lib';
import {concatMap, forkJoin, of, tap, throwError} from 'rxjs';

const DoiPanel = ({open, setOpen, settings}) => {
  const [processing, setProcessing] = useState(() => false);
  const [fetching, setFetching] = useState(() => false);
  const [creating, setCreating] = useState(() => false);
  const [deleting, setDeleting] = useState(() => false);
  const [publishing, setPublishing] = useState(() => false);
  const [hiding, setHiding] = useState(() => false);
  const [partials, setPartials] = useState(() => []);
  const [total, setTotal] = useState(() => 0);

  const onClose = useCallback(() => setOpen(false), []);
  const onAbort = useCallback(() => {}, []); // TODO

  const onFetch = useCallback(() => {}); // TODO
  const onCreate = useCallback(() => setCreating(true), []); // TODO
  const onDelete = useCallback(() => {}, []); // TODO
  const onPublish = useCallback(() => {}, []); // TODO
  const onHide = useCallback(() => {}, []); // TODO

  useEffect(() => setProcessing(fetching || creating || deleting || publishing || hiding), [
    fetching,
    creating,
    deleting,
    publishing,
    hiding,
  ]);

  useEffect(() => {
    if (fetching || creating || deleting || publishing || hiding) {
      const method = resolveMethod();

      const actions = buildActions();

      const [task_id, socket] = openSocket(settings);

      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: stopTasks,
        error: error => {
          console.log(error);
          stopTasks();
        },
      });

      of(null)
        .pipe(
          concatMap(() =>
            forkJoin({
              event: fetchJson('settings-and-event-data'), // TODO serve ?!?!
            })
          ),
          concatMap(({event}) => {
            if (event.error) {
              return throwError(() => new Error('error'));
            }
            return of(event);
          }),
          tap(event => {
            setPartials([]);

            const params = {
              event: event.result.event,
              cookies: event.result.cookies,
              settings: event.result.settings,
            };

            socket.next({
              head: {
                code: 'task:exec',
                uuid: task_id,
              },
              body: {
                method: method,
                params: params,
              },
            });
          })
        )
        .subscribe();

      return () => {
        if (socket) {
          socket.complete();
        }
      };
    }
  }, [fetching, creating, deleting, publishing, hiding]);

  const buildActions = () => {
    return {
      'task:progress': (head, body) => {
        if (!body.params) {
          return;
        }

        if (fetching) {
          setPartials(prevPartials => [...prevPartials, <DoiStatusItem item={body.params} />]);
        }

        if (creating) {
          setPartials(prevPartials => {
            console.log(prevPartials);
            return [
              ...prevPartials,
              <DoiProgressItem item={body.params} update="Created" index={prevPartials.length} />,
            ];
          });
        }

        if (deleting) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Deleted" />,
          ]);
        }

        if (publishing) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Published" />,
          ]);
        }

        if (hiding) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Hidden" />,
          ]);
        }
      },
      'task:result': (head, body) => {
        if (!body.params) {
          return;
        }

        if (fetching) {
          setPartials(prevPartials => [...prevPartials, <DoiStatusItem item={body.params} />]);
        }

        if (creating) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Created" index={prevPartials.length} />,
          ]);
        }

        if (deleting) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Deleted" />,
          ]);
        }

        if (publishing) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Published" />,
          ]);
        }

        if (hiding) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem item={body.params} update="Hidden" />,
          ]);
        }
      },
    };
  };

  const resolveMethod = () => {
    if (fetching) return 'event_doi_fetch';
    if (creating) return 'event_doi_draft';
    if (deleting) return 'event_doi_delete';
    if (publishing) return 'event_doi_publish';
    if (hiding) return 'event_doi_hide';
  };

  const stopTasks = () => {
    if (fetching) setFetching(false);
    if (creating) setCreating(false);
    if (deleting) setDeleting(false);
    if (publishing) setPublishing(false);
    if (hiding) setHiding(false);
  };

  return (
    <Modal open={open} className="doi-panel">
      <Modal.Header>Digital Objects Identifiers Management</Modal.Header>
      <Modal.Content>
        <List>{partials}</List>
      </Modal.Content>
      <Modal.Content>
        <Progress color="blue" active={processing} progress="ratio" value={partials.length} total={total} />
      </Modal.Content>
      <Modal.Actions>
        {processing ? (
          <Button size="mini" content="Abort" negative onClick={onAbort} />
        ) : (
          <Button size="mini" content="Close" onClick={onClose} />
        )}
        <Button.Group size="mini">
          <Button
            content="Create"
            title="Create conference DOIs in draft state"
            onClick={onCreate}
            disabled={processing}
            loading={creating}
            icon="cloud upload"
            color="blue"
          />
          <Button
            content="Delete"
            title="Delete conference DOIs"
            onClick={onDelete}
            disabled={processing}
            loading={deleting}
            icon="remove"
            color="red"
          />
          <Button
            content="Publish"
            title="Publish conference DOIs"
            onClick={onPublish}
            disabled={processing}
            loading={publishing}
            icon="eye"
            color="green"
          />
          <Button
            content="Hiding"
            title="Hide conference DOIs"
            onClick={onHide}
            disabled={processing}
            loading={hiding}
            icon="hide"
            color="grey"
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
};

const DoiStatusItem = doi => {
  return (
    <List.Item className='doi-status'>
      <div>{doi.id}</div>
      <div>{doi.status}</div>
    </List.Item>
  );
};

const DoiProgressItem = (doi, update, index) => {
  return (
    <List.Item className='doi-progress' key={index}>
      {doi.id}...{update}!
    </List.Item>
  );
};

export default DoiPanel;
