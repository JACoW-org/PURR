import React, {useCallback, useEffect, useRef, useState} from 'react';
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

  const anchorRef = useRef(null);

  const onClose = useCallback(() => setOpen(false), []);
  const onAbort = useCallback(() => {}, []); // TODO

  const onFetch = useCallback(() => {}); // TODO
  const onCreate = useCallback(() => setCreating(true), []);
  const onDelete = useCallback(() => setDeleting(true), []);
  const onPublish = useCallback(() => setPublishing(true), []);
  const onHide = useCallback(() => setHiding(true), []);

  useEffect(() => setProcessing(fetching || creating || deleting || publishing || hiding), [
    fetching,
    creating,
    deleting,
    publishing,
    hiding,
  ]);

  useEffect(() => {
    if (fetching || creating || deleting || publishing || hiding) {

      // reset params
      setTotal(0);

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
                text: 'task:exec',
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

  // scrolling handler
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.scrollIntoView({behavior: 'smooth', block: 'end'});
    }
  }, [partials]);

  const buildActions = () => {
    return {
      'task:progress': (head, body) => {
        console.log(body);

        if (!body.params || body.params.phase !== 'doi_result') {
          return;
        }

        const doi = body.params.result.doi;
        const code = body.params.result.text;
        const total = body.params.result.total;

        setTotal(total);

        console.log(doi);

        if (fetching) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiStatusItem doi={doi} index={doi.id} key={doi.id} />,
          ]);
        }

        if (creating && doi) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Created" key={doi.id} />,
          ]);
        }

        if (deleting && code) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={`Doi for contribution ${code}`} update="Deleted" key={code} />,
          ]);
        }

        if (publishing) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Published" index={doi.id} key={doi.id} />,
          ]);
        }

        if (hiding) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Hidden" index={doi.id} key={doi.id} />,
          ]);
        }
      },
      'task:result': (head, body) => {
        if (!body.params || body.params.phase !== 'doi_result') {
          return;
        }

        const doi = body.params.result.doi;

        if (!doi) {
          return;
        }

        console.log(doi);

        if (fetching) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiStatusItem doi={doi} index={doi.id} key={doi.id} />,
          ]);
        }

        if (creating) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Created" index={doi.id} key={doi.id} />,
          ]);
        }

        if (deleting) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={text} update="Deleted" index={doi.id} key={doi.id} />,
          ]);
        }

        if (publishing) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Published" index={doi.id} key={doi.id} />,
          ]);
        }

        if (hiding) {
          setPartials(prevPartials => [
            ...prevPartials,
            <DoiProgressItem text={doi.id} update="Hidden" index={doi.id} key={doi.id} />,
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
      <Modal.Content scrolling>
        <List>{partials}</List>
        <div ref={anchorRef} />
      </Modal.Content>
      <Modal.Content>
        <Progress
          color="blue"
          active={processing}
          progress="ratio"
          value={partials.length}
          total={total}
        />
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

const DoiStatusItem = ({doi, index}) => {
  console.log(doi, index);
  return (
    <List.Item className="doi-status" key={index}>
      <div>{doi.id}</div>
      <div>{doi.status}</div>
    </List.Item>
  );
};

const DoiProgressItem = ({text, update}) => {
  return (
    <List.Item className="doi-progress">
      {text}...{update}!
    </List.Item>
  );
};

export default DoiPanel;
