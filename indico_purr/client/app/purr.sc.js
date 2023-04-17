import {map} from 'lodash';
import React, {useState, useEffect, useCallback} from 'react';
import {catchError, concatMap, finalize, of, tap, throwError} from 'rxjs';
import {Button, Card, Icon} from 'semantic-ui-react';

import {putJson} from './purr.lib';
import {SettingsDialog} from './settings/purr.settings.dialog';

export const PurrSettingsCard = ({settings, setSettings, connected}) => {
  const [loading, setLoading] = useState(() => false);
  const [dialogLoading, setDialogLoading] = useState(() => false);
  const [open, setOpen] = useState(() => false);
  const [formErrors, setFormErrors] = useState(() => {});

  const onClose = useCallback(() => setOpen(false), []);
  const onSubmit = useCallback(formData => {
    setSettings(formData);
    setDialogLoading(true);
  }, []);
  const onConnect = useCallback(() => console.log('connect'), []);
  const onDisconnect = useCallback(() => console.log(settings), [settings]); // TODO when implementing real disconnect, remove dependency

  useEffect(() => {
    if (dialogLoading) {
      const body = {
        settings: {
          ...settings,
          custom_fields: map(settings.custom_fields, field => field.id)
        },
      };

      of(null)
        .pipe(
          concatMap(() => putJson('settings-data', body)),
          // tap(event => console.log(event.result)),
          concatMap(event => {
            // TODO handle REST errors properly
            if (event.error) {
              throw new Error('error saving PURR settings');
            }

            return of(event.result);
          }),
          catchError(error => {
            console.log(error);
            return of(true);
          }), // TODO show error
          tap(result => {
            setDialogLoading(false);
            if (result.is_valid) {
              setOpen(false);
              // TODO show success card
            } else {
              setFormErrors(result.errors);
            }
          })
        )
        .subscribe();
    }
    return () => {};
  }, [dialogLoading]);

  return (
    <>
      <Card fluid>
        <Card.Content>
          <Card.Header>{connected ? 'Plugin connected' : 'Plugin disconnected'}</Card.Header>
          <Card.Meta>{connected ? settings.api_url : ''}</Card.Meta>
        </Card.Content>

        <Card.Content extra>
          <div className="ui left">
            {loading ? (
              <div>
                <Icon loading name="spinner" />
                Processing...
              </div>
            ) : (
              <div>
                <Icon name="plug" />
                Ready.
              </div>
            )}
          </div>
          <div className="ui right">
            {connected ? (
              <>
                {' '}
                <Button
                  onClick={() => setOpen(true)}
                  // loading={loading}
                  // disabled={loading}
                  primary
                  compact
                  size="mini"
                  icon="right chevron"
                  content="Settings"
                />
                <Button
                  onClick={onDisconnect}
                  negative
                  compact
                  size="mini"
                  icon="right chevron"
                  content="Disconnect"
                />
              </>
            ) : (
              <>
                <Button
                  onClick={onConnect}
                  positive
                  compact
                  size="mini"
                  icon="right chevron"
                  content="Connect"
                />
              </>
            )}
          </div>
        </Card.Content>
      </Card>
      <SettingsDialog
        settings={settings}
        open={open}
        setOpen={setOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={dialogLoading}
        errors={formErrors}
      />
    </>
  );
};
