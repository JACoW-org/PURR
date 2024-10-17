import { Container, Card, Icon, Message } from 'semantic-ui-react';
import { catchError, concatMap, of, tap, finalize, filter, map } from 'rxjs';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { notificationRequestPermission } from './utils/purr.utils'
import { getEventId, getEventTitle } from './purr.lib';
import { PurrFinalProceedings } from './purr.fp';
import { PurrAbstractBooklet } from './purr.ab';
import { fetchPing, fetchSettings } from './api/purr.api';
import { PurrSettingsCard } from './purr.sc';
import { PurrPapersChecks } from './purr.pc';
import { ErrorProvider, useError } from './contexts/ErrorProvider';


document.addEventListener('DOMContentLoaded', () => {

  const purrSpa = document.getElementById('purr-spa');
  if (purrSpa) {

    notificationRequestPermission();

    const eventId = getEventId();
    const eventTitle = getEventTitle();

    // console.log('eventId -->', eventId);
    // console.log('eventTitle -->', eventTitle);

    const PurrHome = () => {
      const [settings, setSettings] = useState();
      const [settingsValid, setSettingsValid] = useState(() => false);
      const [connected, setConnected] = useState(() => false);
      const [loading, setLoading] = useState(() => false);
      const [processing, setProcessing] = useState(() => false);

      const { handleError } = useError();

      const handleConnectionError = (error) => {
        if (error.status === 401) {
          handleError({ message: 'Connection to MEOW failed. Please set a valid API key.' });
        } else {
          handleError({ message: 'Connection to MEOW failed. Please set a valid API URL' });
        }

        throw new Error(error.message);
      }

      useEffect(() => {
        const sub$ = of(null)
          .pipe(
            tap(() => setLoading(true)),
            concatMap(() => fetchSettings().pipe(
              catchError(error => {
                console.log(error); // TODO display error card
                return of(null);
              })
            )),
            filter(result => !!result),
            tap(result => {
              setSettings(result.settings);
              setSettingsValid(result.valid);
            }),
            map(result => result.settings),
            filter(settings => !!settings.api_url && !!settings.api_key),
            concatMap(settings => fetchPing(settings.api_url, settings.api_key)), // API_KEY validation
            tap(result => !!result?.error && handleConnectionError(result)),
            map(result => !result.error),
            tap(connected => setConnected(connected)),
            finalize(() => setLoading(false))
          )
          .subscribe();

        return () => sub$.unsubscribe();
      }, []);

      return (
        <>
          <Container fluid>
            {' '}
            {loading ? (
              <div>
                <Icon loading name="spinner" />
                Processing...
              </div>
            ) : (
              <div>
                <Card.Group>
                  <PurrSettingsCard
                    eventId={eventId}
                    settings={settings}
                    setSettings={setSettings}
                    connected={connected}
                    setConnected={setConnected}
                    setSettingsValid={setSettingsValid}
                    processing={processing}
                    setProcessing={setProcessing}
                  />
                  {connected ? (
                    <>
                      <PurrAbstractBooklet
                        settings={settings}
                        settingsValid={settingsValid}
                        processing={processing}
                        setProcessing={setProcessing}
                      />
                      <PurrPapersChecks
                        settings={settings}
                        settingsValid={settingsValid}
                        processing={processing}
                        setProcessing={setProcessing}
                      />
                      <PurrFinalProceedings
                        eventId={eventId}
                        eventTitle={eventTitle}
                        settings={settings}
                        settingsValid={settingsValid}
                        processing={processing}
                        setProcessing={setProcessing}
                        setConnected={setConnected}
                      />
                      {settingsValid ? (
                        <></>
                      ) : (
                        <Message warning>
                          <Message.Header>Check settings</Message.Header>
                          <p>
                            It looks like one or more settings are not valid! Please configure the
                            settings before using any task!
                          </p>
                        </Message>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </Card.Group>
              </div>
            )}
          </Container>
        </>
      );
    };

    ReactDOM.render(
      <ErrorProvider>
        <PurrHome />
      </ErrorProvider>,
      purrSpa);
  }
});
