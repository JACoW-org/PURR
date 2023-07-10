import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';
import {of} from 'rxjs';
import {catchError, filter, finalize, switchMap, tap} from 'rxjs/operators';

import {PurrErrorAlert} from './purr.error.alert';
import FinalProcPanel from './final-proceedings/purr.fp.panel';
import {fetchInfo} from './api/purr.api';
import DoiPanel from './final-proceedings/purr.doi.panel';

export const PurrFinalProceedings = ({
  eventId,
  eventTitle,
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

  const onFPPanelOpening = useCallback(() => setFPPanelOpening(true), [eventId, settings]);
  const onDOIPanelOpening = useCallback(() => setDOIPanelOpening(true), [eventId, settings]);

  const fetchFPInfo = (apiUrl, eventId, apiKey) => {
    return of(null).pipe(
      tap(() => setLoading(true)),
      switchMap(() => fetchInfo(apiUrl, eventId, apiKey)),
      catchError(error => {
        console.log(error);
        setErrorMessage('PURR could not retrieve final proceedings info. Please retry or contact an admin.');
        showError(true);
        return of(null);
      }),
      filter(result => !!result),
      tap(result => setFPInfo(result.info.value)),
      finalize(() => setLoading(false))
    );
  };

  useEffect(() => {
    const sub$ = fetchFPInfo(settings.api_url, eventId, settings.api_key).subscribe();

    return () => sub$.unsubscribe();
  }, []);

  useEffect(() => {
    setProcessing(loading || fpPanelOpening || doiPanelOpening);
    return () => {};
  }, [loading, fpPanelOpening, doiPanelOpening]);

  // useEffect info API when opening FP or DOI panels
  useEffect(() => {
    if (fpPanelOpening || doiPanelOpening) {
      const sub$ = fetchFPInfo(settings.api_url, eventId, settings.api_key)
        .pipe(
          tap(() => {
            if (fpPanelOpening) {
              setFPPanelOpening(false);
              setOpenFPPanel(true);
            }

            if (doiPanelOpening) {
              setDOIPanelOpening(false);
              setOpenDOIPanel(true);
            }
          })
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
            <Button.Group size="mini">
              <Button
                title="Digital Object Identifier"
                labelPosition="left"
                icon="globe"
                content="DOI"
                onClick={onDOIPanelOpening}
                disabled={!settingsValid || processing || !fpInfo?.datacite_json}
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
        eventTitle={eventTitle}
        fpInfo={fpInfo}
        setFPInfo={setFPInfo}
      />
      <DoiPanel
        open={openDOIPanel}
        setOpen={setOpenDOIPanel}
        settings={settings}
        eventTitle={eventTitle}
        fpInfo={fpInfo}
      />
    </>
  );
};
