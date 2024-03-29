import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Icon, Modal, Label, Table } from 'semantic-ui-react';
import { of, forkJoin, throwError } from 'rxjs';
import { size, map, isNil } from 'lodash';
import { concatMap } from 'rxjs/operators';

import { openSocket, fetchJson, runPhase } from './purr.lib';
import { PurrErrorAlert } from './purr.error.alert';

export const PurrPapersChecks = ({ settings, settingsValid, processing, setProcessing }) => {
  const [errors, setErrors] = useState(() => undefined);
  const [loading, setLoading] = useState(() => false);
  const [progress, setProgress] = useState(() => 'Processing...');
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);

  const onCheck = useCallback(() => setLoading(true), []);

  const goToContrib = useCallback(
    error => (window.open(`${error.url}/editing/paper`, '_black').focus()),
    []
  );

  useEffect(() => {
    setProcessing(loading);
    return () => { }
  }, [loading])

  useEffect(() => {
    if (settings && loading) {
      const [task_id, socket] = openSocket(settings);

      const actions = {
        'task:progress': (head, body) => {
          /* if (body?.params?.text) {
                        console.log(body.params.text)
                        // setProgress(`${body.params.text}`)
                    } */
        },
        'task:result': (head, body) => {
          console.log(head, body);

          if (size(body?.params?.errors) > 0) {
            setErrors(body?.params?.errors);
          } else {
            setErrors([]);
          }
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

      socket.subscribe({
        next: ({ head, body }) => runPhase(head, body, actions, socket),
        complete: () => setLoading(false),
        error: err => {
          console.error(err);
          setErrorMessage(`Error while checking conference's PDF files.`);
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
                method: `event_papers_check`,
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
          <Card.Header>Papers Check</Card.Header>
          <Card.Meta>Click "Check" button to act papers checks.</Card.Meta>
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
            <Button.Group size='mini'>
              <Button
                onClick={onCheck}
                loading={loading}
                disabled={processing || !settingsValid}
                primary
                compact
                size="mini"
                labelPosition="right"
                icon="bug"
                content="Validate"
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

      {errors ? (
        <Modal size="large" open={!isNil(errors)} onClose={() => setErrors(undefined)}>
          <Modal.Header>PDF Check Report</Modal.Header>
          <Modal.Content image scrolling>
            <Modal.Description>
              {size(errors) > 0 ? (
                <Table celled striped compact>
                  <Table.Body>
                    {map(errors, error => (
                      <Table.Row key={error.code}>
                        <Table.Cell singleLine>
                          <b>{error.code}</b>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="pdf-check-title">{error.title}</span>
                        </Table.Cell>
                        <Table.Cell singleLine>
                          {error.page_size === false ? (
                            <Label color="red" size="tiny">
                              PAGE SIZE
                            </Label>
                          ) : (
                            <></>
                          )}
                          {error.font_emb === false ? (
                            <Label color="red" size="tiny">
                              EMBEDDED FONTS
                            </Label>
                          ) : (
                            <></>
                          )}
                        </Table.Cell>
                        <Table.Cell singleLine>
                          <Button onClick={() => goToContrib(error)} compact size="mini">
                            Open
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <Label color="green">No errors</Label>
              )}
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setErrors(undefined)} primary compact size="mini">
              Close <Icon name="chevron right" />
            </Button>
          </Modal.Actions>
        </Modal>
      ) : (
        <></>
      )}
    </>
  );
};

// <Grid divided='vertically' key={error.code}>
//
// <Grid.Column width='sixteen'>
//     <b>{error.code}</b>
// </Grid.Column>
//
// <Grid.Column width='fourteen'>
//     {error.page_size === false ? <Label color='red' size='tiny'>PAGE SIZE</Label> : <></>}
//     {error.font_emb === false ? <Label color='red' size='tiny'>EMBEDDED FONTS</Label> : <></>}
// </Grid.Column>
//
// <Grid.Column width='two'>
//     <Button onClick={() => goToContrib(error)} compact size='mini'>Open</Button>
// </Grid.Column>
//
// <Grid.Column width='sixteen'>
//     <small>{error.title}</small>
// </Grid.Column>
//
// </Grid>
