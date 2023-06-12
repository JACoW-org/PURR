import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Icon } from 'semantic-ui-react';
import { of, forkJoin, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { downloadByUrl, openSocket, fetchJson, runPhase } from './purr.lib';
import { PurrErrorAlert } from './purr.error.alert';
import FinalProcPanel from './final-proceedings/purr.fp.panel';

export const PurrFinalProceedings = ({ settings, settingsValid }) => {
  const [loading, setLoading] = useState(() => false); // TODO rimuovere non appena logica loading completamente spostata
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);

  const [draftDoi, setDraftDoi] = useState(() => false);
  const [deleteDoi, setDeleteDoi] = useState(() => false);
  const [hideDoi, setHideDoi] = useState(() => false);
  const [publishDoi, setPublishDoi] = useState(() => false);
  const [compressProceedings, setCompressProceedings] = useState(() => false);
  const [downloadProceedings, setDownloadProceedings] = useState(() => false);


  const onDraftDoi = useCallback(() => setDraftDoi(true), []);
  const onDeleteDoi = useCallback(() => setDeleteDoi(true), []);
  const onHideDoi = useCallback(() => setHideDoi(true), []);
  const onPublishDoi = useCallback(() => setPublishDoi(true), []);

  const onCompressProceedings = useCallback(() => setCompressProceedings(true), []);
  const onDownloadProceedings = useCallback(() => setDownloadProceedings(true), []);


  const onFinishTask = useCallback(() => {

    setCompressProceedings(false);
    setDownloadProceedings(false);

    setDraftDoi(false);
    setDeleteDoi(false);
    setHideDoi(false);
    setPublishDoi(false);

  }, []);


  useEffect(() => {

    console.log(`useEffect -->`)

    if (settings) {

      if (downloadProceedings) {

        downloadByUrl

      } else

        if (draftDoi || deleteDoi || hideDoi || publishDoi || compressProceedings) {

          const method = (
            draftDoi ? `event_doi_draft` : (
              deleteDoi ? `event_doi_delete` : (
                hideDoi ? `event_doi_hide` : (
                  publishDoi ? `event_doi_publish` : (
                    compressProceedings ? `event_compress_proceedings` : (
                      undefined
                    )
                  )
                )
              )
            )
          )

          console.log(`useEffect --> method: ${method}`)

          const [task_id, socket] = openSocket(settings);

          const actions = {
            'task:progress': (head, body) => console.log(head, body),
            'task:result': (head, body) => console.log(head, body),
          };

          socket.subscribe({
            next: ({ head, body }) => runPhase(head, body, actions, socket),
            complete: () => onFinishTask(),
            error: err => {
              console.error(err);
              setErrorMessage('Error while generating the abstract booklet.');
              setShowError(true);
              onFinishTask();
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
    }

  }, [settings, draftDoi, deleteDoi, hideDoi, publishDoi, compressProceedings, downloadProceedings]);

  return (
    <>
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
            <Button icon title='draft doi' onClick={onDraftDoi} disabled={!settingsValid} primary size='mini'>
              <Icon name='server' />
            </Button>
            <Button icon title='hide doi' onClick={onHideDoi} disabled={!settingsValid} primary size='mini'>
              <Icon name='server' />
            </Button>
            <Button icon title='delete doi' onClick={onDeleteDoi} disabled={!settingsValid} primary size='mini'>
              <Icon name='server' />
            </Button>
            <Button icon title='publish doi' onClick={onPublishDoi} disabled={!settingsValid} primary size='mini'>
              <Icon name='server' />
            </Button>
            <Button icon title='compress' onClick={onCompressProceedings} disabled={!settingsValid} primary size='mini'>
              <Icon name='compress' />
            </Button>
            <Button icon title='download' onClick={onDownloadProceedings} disabled={!settingsValid} primary size='mini'>
              <Icon name='download' />
            </Button>
            <Button icon onClick={() => setOpenPanel(true)} disabled={!settingsValid} primary size='mini'>
              <Icon name='book' />
            </Button>
          </div>
        </Card.Content>
      </Card>
      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
      <FinalProcPanel open={openPanel} setOpen={setOpenPanel} settings={settings} />
    </>
  );
};
