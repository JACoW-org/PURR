import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';
import {of, forkJoin, throwError} from 'rxjs';
import {concatMap} from 'rxjs/operators';

import {downloadByUrl, openSocket, fetchJson, runPhase} from './purr.lib';
import {PurrErrorAlert} from './purr.error.alert';
import FinalProcPanel from './final-proceedings/purr.fp.panel';

export const PurrFinalProceedings = ({settings, settingsValid}) => {
  const [loading, setLoading] = useState(() => false); // TODO rimuovere non appena logica loading completamente spostata
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);

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
            <Button icon primary size='mini'>
              <Icon name='server' />
            </Button>
            <Button icon primary size='mini'>
              <Icon name='download' />
            </Button>
            <Button icon onClick={() => setOpenPanel(true)} disabled={!settingsValid} primary size='mini'>
              <Icon name='book' />
            </Button>
            {/* <Button
              onClick={() => setOpenPanel(true)}
              disabled={!settingsValid}
              primary
              compact
              size="mini"
              icon="right chevron"
              content="Download"
            /> */}
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
