import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Container, Card, Icon, Message } from 'semantic-ui-react';

import { PurrSettingsCard } from './purr.sc';
import { PurrAbstractBooklet } from './purr.ab';
import { PurrPapersChecks } from './purr.pc';
import { PurrFinalProceedings } from './purr.fp';
import { catchError, concatMap, of, tap } from 'rxjs';
import { fetchSettings } from './api/purr.api';
import { getEventId } from './purr.lib';

document.addEventListener('DOMContentLoaded', () => {

  const purrSpa = document.getElementById('purr-spa');
  if (purrSpa) {

    const eventId = getEventId();

    console.log('eventId -->', eventId);

    const PurrHome = () => {
      const [settings, setSettings] = useState();
      const [settingsValid, setSettingsValid] = useState(false);
      const [connected, setConnected] = useState(false);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        const sub$ = of(null)
          .pipe(
            tap(() => setLoading(true)),
            concatMap(() => fetchSettings()),
            catchError(error => {
              console.log(error); // TODO display error card
              return of(true);
            }),
            tap(result => {
              setSettings(result.settings);
              setSettingsValid(result.valid);
              setConnected(!!result.settings.connected);
              setLoading(false);
            })
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
                  settings={settings}
                  setSettings={setSettings}
                  connected={connected}
                  setConnected={setConnected}
                  setSettingsValid={setSettingsValid}
                />
                {connected ? (
                  <>
                    <PurrAbstractBooklet settings={settings} settingsValid={settingsValid} />
                    <PurrPapersChecks settings={settings} settingsValid={settingsValid} />
                    <PurrFinalProceedings eventId={eventId} settings={settings} settingsValid={settingsValid} />
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
