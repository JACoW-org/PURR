import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Container, Card, Icon} from 'semantic-ui-react';

import {PurrSettingsCard} from './purr.sc';
import {PurrAbstractBooklet} from './purr.ab';
import {PurrPapersChecks} from './purr.pc';
import {PurrFinalProceedings} from './purr.fp';
import {catchError, concatMap, of, tap} from 'rxjs';
import { fetchSettings } from './api/purr.api';

document.addEventListener('DOMContentLoaded', () => {
  const PurrHome = () => {
    const [settings, setSettings] = useState();
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
          tap(settings => {
            setSettings(settings);
            setConnected(!!settings.connected);
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
                setConnected={connected}
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

  ReactDOM.render(<PurrHome />, document.getElementById('purr-spa'));
});
