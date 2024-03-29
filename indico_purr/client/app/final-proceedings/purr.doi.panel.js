import {Button, Table, Modal, Progress, Label} from 'semantic-ui-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {catchError, concatMap, forkJoin, of, tap, throwError} from 'rxjs';
import {fetchJson, openSocket, runPhase} from '../purr.lib';
import {sortedIndexBy} from 'lodash';
import {PurrErrorAlert} from '../purr.error.alert';

const DoiPanel = ({open, setOpen, settings, eventTitle, fpInfo}) => {
  const [processing, setProcessing] = useState(() => false);
  const [fetching, setFetching] = useState(() => false);
  const [creating, setCreating] = useState(() => false);
  const [deleting, setDeleting] = useState(() => false);
  const [publishing, setPublishing] = useState(() => false);
  const [hiding, setHiding] = useState(() => false);
  const [partials, setPartials] = useState(() => []);
  const [total, setTotal] = useState(() => 0);
  const [progressStatus, setProgressStatus] = useState(() => null); // 'success' || 'error' || 'active' || 'aborted'

  const [showError, setShowError] = useState(() => false);
  const [errorMessage, setErrorMessage] = useState(() => null);

  const anchorRef = useRef(null);

  const onClose = useCallback(() => setOpen(false), []);
  const onAbort = useCallback(() => {
    setProgressStatus('aborted');

    if (fetching) {
      setFetching(false);
    }

    if (creating) {
      setCreating(false);
    }

    if (deleting) {
      setDeleting(false);
    }

    if (publishing) {
      setPublishing(false);
    }

    if (hiding) {
      setHiding(false);
    }
  }, [fetching, creating, deleting, publishing, hiding]);

  const onFetch = useCallback(() => setFetching(true));
  const onCreate = useCallback(() => setCreating(true), []);
  const onDelete = useCallback(() => setDeleting(true), []);
  const onPublish = useCallback(() => setPublishing(true), []);
  const onHide = useCallback(() => setHiding(true), []);

  useEffect(() => {
    setProcessing(fetching || creating || deleting || publishing || hiding);
  }, [fetching, creating, deleting, publishing, hiding]);

  useEffect(() => {
    if (fetching || creating || deleting || publishing || hiding) {
      setTotal(0); // reset params

      setProgressStatus('active');

      const method = resolveMethod();

      const [task_id, socket] = openSocket(settings);

      const actions = buildActions(socket);

      socket.subscribe({
        next: ({head, body}) => runPhase(head, body, actions, socket),
        complete: () => {
          stopTasks();
          setProgressStatus(current => current === 'active' ? 'error' : current);
        },
        error: error => {
          console.log(error);

          setErrorMessage('Failed to start task. Check connection with MEOW.');
          setShowError(true);
          setProgressStatus('error');

          stopTasks();
        },
      });

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
            return of(event);
          }),
          catchError(error => {
            console.log(error);

            setErrorMessage(
              'Failed to fetch settings and data for this event. Retry or contact an admin.'
            );
            setShowError(true);
            stopTasks();
            setProgressStatus('error');

            throw error;
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

  useEffect(() => {
    if (open) {
      if (!fpInfo.datacite_json) {
        setErrorMessage(
          'MEOW could not retrieve any info. Please make sure that final proceedings have been correctly generated.'
        );
        setShowError(true);

        return () => {};
      }
      setFetching(true);
    } else {
      setPartials([]);
    }

    return () => {};
  }, [open]);

  // scrolling handler
  useEffect(() => {
    if (anchorRef.current) {
      anchorRef.current.scrollIntoView({behavior: 'smooth', block: 'end'});
    }
  }, [partials]);

  const buildActions = socket => {
    return {
      'task:progress': (head, body) => {
        console.log(body);

        if (!body.params || body.params.phase !== 'doi_result') {
          return;
        }

        const doi = body.params.result.doi;
        const total = body.params.result.total;
        const identifier = body.params.result.id;
        const error = body.params.result.error;

        setTotal(total);

        if (fetching || creating || deleting || publishing || hiding) {
          setPartials(prevPartials =>
            insertPartialInSortedArray(prevPartials, identifier, doi, error)
          );
        }
      },
      'task:result': (head, body) => {

        setProgressStatus('success');

        // if (!body.params || body.params.phase !== 'doi_result') {
        //   return;
        // }

        // const doi = body.params.result.doi;
        // const identifier = body.params.result.id;
        // const error = body.params.result.error;

        // if (fetching || creating || deleting || publishing || hiding) {
        //   setPartials(prevPartials =>
        //     insertPartialInSortedArray(prevPartials, identifier, doi, error)
        //   );
        // }
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
  };

  const insertPartialInSortedArray = (partials, identifier, doi, error) => {
    const newIndex = sortedIndexBy(partials, {key: identifier}, 'key');
    const newPartial = {
      key: identifier,
      jsx: <DoiStatusItem id={identifier} key={identifier} doi={doi} error={error} />,
    };
    return [...partials.slice(0, newIndex), newPartial, ...partials.slice(newIndex)];
  };

  const resolveMethod = () => {
    if (fetching) return 'event_doi_info';
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
      <Modal.Header>{eventTitle} - Digital Objects Identifiers Management</Modal.Header>
      <Modal.Content scrolling>
        <Table celled striped compact textAlign="center" fixed>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Identifier</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{partials?.map(partial => partial.jsx)}</Table.Body>
        </Table>

        <div ref={anchorRef} />
      </Modal.Content>
      <Modal.Content>
        <Progress
          color="blue"
          progress={partials.length > 0 ? 'ratio' : false}
          value={partials.length}
          total={total}
          active={progressStatus === 'active'}
          success={progressStatus === 'success'}
          error={progressStatus === 'error'}
          warning={progressStatus === 'aborted'}
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
            content="Refresh"
            title="Refresh conference DOIs"
            onClick={onFetch}
            disabled={processing}
            loading={fetching}
            icon="refresh"
            color="pink"
          />
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
            content="Hide"
            title="Hide conference DOIs"
            onClick={onHide}
            disabled={processing}
            loading={hiding}
            icon="hide"
            color="grey"
          />
        </Button.Group>
      </Modal.Actions>

      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
    </Modal>
  );
};

const DoiStatusItem = ({id, doi, code, error, newStatus = null}) => {
  return (
    <Table.Row negative={!!error}>
      <Table.Cell>{id}</Table.Cell>
      <Table.Cell>
        {error ? (
          <DoiError error={error} />
        ) : (
          <DoiState state={newStatus ? newStatus : doi?.attributes?.state} />
        )}
      </Table.Cell>
    </Table.Row>
  );
};

const DoiState = ({state}) => {
  const label = state === 'findable' ? 'published' : state;

  let color;
  switch (label) {
    case 'published':
      color = 'green';
      break;
    case 'registered':
      color = 'violet';
      break;
    case 'draft':
      color = 'blue';
      break;
    default:
      color = 'pink';
  }

  return (
    <Label color={color} horizontal>
      {/* Capitalize first letter */}
      {label.replace(/^\w/, char => char.toUpperCase())}
    </Label>
  );
};

const DoiError = ({error}) => {
  let errorMessage;
  switch (error) {
    case 400:
      errorMessage = 'Bad request. Contact administrator.';
      break;
    case 401:
      errorMessage = 'Unauthorized - Check your credentials in the settings.';
      break;
    case 403:
      errorMessage =
        'Forbidden - Check your credentials in the settings or validate that you are updating a DOI/prefix/repository you have permissions for.';
    case 404:
      errorMessage =
        'Not Found - The resource is not found. Check that final proceedings have been generated correctly.';
      break;
    case 405:
      errorMessage = 'This operation is not allowed.';
      break;
    case 422:
      errorMessage =
        'Check the contents of your request, the system understood but it was unable to process it. For a DOI update this might be invalid URL or metadata is invalid.';
      break;
    case 500:
      errorMessage = 'Contact administrator.';
      break;
    case 502:
      errorMessage = 'Most likely a temporary issue, try again.';
      break;
    case 503:
    case 504:
      errorMessage = 'Check service status in status.datacite.org';
      break;
    default:
      errorMessage = error;
  }

  return <p>{errorMessage}</p>;
};

export default DoiPanel;
