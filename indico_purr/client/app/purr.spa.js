import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Container, Card, Icon} from 'semantic-ui-react';

import {PurrSettingsCard} from './purr.sc';
import {PurrAbstractBooklet} from './purr.ab';
import {PurrPapersChecks} from './purr.pc';
import {PurrFinalProceedings} from './purr.fp';
import {fetchJson} from './purr.lib';
import {catchError, concatMap, of, tap} from 'rxjs';

document.addEventListener('DOMContentLoaded', () => {
  const PurrHome = () => {

    const [settings, setSettings] = useState();
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
      of(null)
        .pipe(
          tap(() => setLoading(true)),
          concatMap(() => fetchJson('settings-and-event-data')),
          concatMap(event => {
            if (event.error) {
              throw new Error('error fetching PURR settings');
            }

            return of(event.result);
          }),
          catchError(error => {
            console.log(error); // TODO display error card
            return of(true);
          }),
          tap(result => {
            setSettings(result.settings);
            setConnected(!!result.settings.connected);
            setLoading(false);
          })
        )
        .subscribe();
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
              />
              <PurrAbstractBooklet />
              <PurrPapersChecks />
              <PurrFinalProceedings />
            </Card.Group>
          </div>
        )}
      </Container>
    );
  };

  ReactDOM.render(
    // <PurrHome>
    //   {loading ? (
    //     <div>
    //       <Icon loading name="spinner" />
    //       Processing...
    //     </div>
    //   ) : (
    //     <div>
    //       <Card.Group>
    //         <PurrSettingsCard />
    //         <PurrAbstractBooklet />
    //         <PurrPapersChecks />
    //         <PurrFinalProceedings />
    //       </Card.Group>
    //     </div>
    //   )}
    // </PurrHome>,
    <PurrHome />,
    document.getElementById('purr-spa')
  );
});
