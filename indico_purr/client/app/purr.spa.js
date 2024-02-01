import { Container, Card, Icon, Message } from 'semantic-ui-react';
import { catchError, concatMap, of, tap, finalize } from 'rxjs';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { notificationRequestPermission } from './utils/purr.utils'
import { getEventId, getEventTitle } from './purr.lib';
import { PurrFinalProceedings } from './purr.fp';
import { PurrAbstractBooklet } from './purr.ab';
import { fetchSettings } from './api/purr.api';
import { PurrSettingsCard } from './purr.sc';
import { PurrPapersChecks } from './purr.pc';


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

      useEffect(() => {
        const sub$ = of(null)
          .pipe(
            tap(() => setLoading(true)),
            concatMap(() => fetchSettings()),
            catchError(error => {
              console.log(error); // TODO display error card
              return of(null);
            }),
            tap(result => {
              if (result) {
                setSettings(result.settings);
                setSettingsValid(result.valid);
                setConnected(!!result.settings.connected);
              }
            }),
            finalize(() => setLoading(false))
          )
          .subscribe();

        return () => sub$.unsubscribe();
      }, []);

      return (
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
      );
    };

    ReactDOM.render(<PurrHome />, purrSpa);
  }
});
