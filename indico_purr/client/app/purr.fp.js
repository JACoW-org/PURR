import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';
import {of, forkJoin, throwError} from 'rxjs';
import {catchError, concatMap, filter, finalize, switchMap, tap} from 'rxjs/operators';

import {downloadByUrl, openSocket, fetchJson, runPhase} from './purr.lib';
import {PurrErrorAlert} from './purr.error.alert';
import FinalProcPanel from './final-proceedings/purr.fp.panel';
import {fetchInfo} from './api/purr.api';
import {isNil, result} from 'lodash';
import DoiPanel from './final-proceedings/purr.doi.panel';

export const PurrFinalProceedings = ({
  eventId,
  settings,
  settingsValid,
  processing,
  setProcessing,
}) => {
  const [loading, setLoading] = useState(() => false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(() => false);
  const [openFPPanel, setOpenFPPanel] = useState(() => false);
  const [openDOIPanel, setOpenDOIPanel] = useState(() => false);
  const [fpPanelOpening, setFPPanelOpening] = useState(() => false);
  const [doiPanelOpening, setDOIPanelOpening] = useState(() => false);
  const [fpInfo, setFPInfo] = useState(() => null);

  const [draftDoi, setDraftDoi] = useState(() => false);
  const [deleteDoi, setDeleteDoi] = useState(() => false);
  const [hideDoi, setHideDoi] = useState(() => false);
  const [publishDoi, setPublishDoi] = useState(() => false);
  const [compressProceedings, setCompressProceedings] = useState(() => false);
  const [downloadProceedings, setDownloadProceedings] = useState(() => false);

  const onFPPanelOpening = useCallback(() => setFPPanelOpening(true), [eventId, settings]);
  const onDOIPanelOpening = useCallback(() => setDOIPanelOpening(true), [eventId, settings]);

  const onDraftDoi = useCallback(() => setDraftDoi(true), []);
  const onDeleteDoi = useCallback(() => setDeleteDoi(true), []);
  const onHideDoi = useCallback(() => setHideDoi(true), []);
  const onPublishDoi = useCallback(() => setPublishDoi(true), []);

  const onFinishTask = useCallback(() => {
    setDraftDoi(false);
    setDeleteDoi(false);
    setHideDoi(false);
    setPublishDoi(false);
  }, []);

  useEffect(() => {
    setProcessing(loading || fpPanelOpening || doiPanelOpening);
    return () => {};
  }, [loading, fpPanelOpening, doiPanelOpening]);

  useEffect(() => {
    console.log(`useEffect -->`);

    if (settings) {
      if (draftDoi || deleteDoi || hideDoi || publishDoi) {
        const method = draftDoi
          ? `event_doi_draft`
          : deleteDoi
          ? `event_doi_delete`
          : hideDoi
          ? `event_doi_hide`
          : publishDoi
          ? `event_doi_publish`
          : undefined;

        console.log(`useEffect --> method: ${method}`);

        const [task_id, socket] = openSocket(settings);

        const actions = {
          'task:progress': (head, body) => console.log(head, body),
          'task:result': (head, body) => console.log(head, body),
        };

        socket.subscribe({
          next: ({head, body}) => runPhase(head, body, actions, socket),
          complete: () => onFinishTask(),
          error: err => {
            console.error(err);
            setErrorMessage('Error while generating the abstract booklet.');
            setShowError(true);
            onFinishTask();
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
                  method: method,
                  params: context.params,
                },
              });

              return of(null);
            })
          )
          .subscribe();
      }

      return () => {};
    }
  }, [settings, draftDoi, deleteDoi, hideDoi, publishDoi]);

  // useEffect info API when opening FP or DOI panels
  useEffect(() => {
    if (fpPanelOpening || doiPanelOpening) {
      const sub$ = of(null)
        .pipe(
          tap(() => setLoading(true)),
          switchMap(() => fetchInfo(settings.api_url, eventId, settings.api_key)),
          catchError(error => {
            // TODO display error
            return of(null);
          }),
          filter(result => !!result),
          tap(result => {
            setFPInfo(result.info);

            if (fpPanelOpening) {
              setFPPanelOpening(false);
              setOpenFPPanel(true);
            }

            if (doiPanelOpening) {
              setDOIPanelOpening(false);
              setOpenDOIPanel(true);
            }
          }),
          finalize(() => setLoading(false))
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    return () => {};
  }, [fpPanelOpening, doiPanelOpening]);

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
                {loading}
              </div>
            ) : (
              <div>
                <Icon name="plug" />
                Ready.
              </div>
            )}
          </div>
          <div className="ui right">
            {/* <Button icon title='draft doi' onClick={onDraftDoi} disabled={!settingsValid} primary size='mini'>
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
            </Button> */}

            <Button.Group size="mini">
              <Button
                title="Digital Object Identifier"
                labelPosition="left"
                icon="globe"
                content="DOI"
                onClick={onDOIPanelOpening}
                disabled={!settingsValid || processing}
                color="facebook"
              />
              <Button.Or />
              <Button
                title="Final Proceedings"
                labelPosition="right"
                content="Site"
                icon="sitemap"
                onClick={onFPPanelOpening}
                disabled={!settingsValid || processing}
                color="blue"
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
      <FinalProcPanel
        open={openFPPanel}
        setOpen={setOpenFPPanel}
        info={fpInfo}
        settings={settings}
      />
      <DoiPanel open={openDOIPanel} setOpen={setOpenDOIPanel} settings={settings} />
    </>
  );
};
