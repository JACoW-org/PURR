import {map} from 'lodash';
import React, {useState, useEffect, useCallback} from 'react';
import {catchError, concatMap, forkJoin, of, tap} from 'rxjs';
import {Button, Card, Icon} from 'semantic-ui-react';
import {
  connect,
  disconnect,
  fetchSettings,
  fetchSettingsAndAttachements,
  saveSettings,
} from './api/purr.api';

import {fetchJson, putJson} from './purr.lib';
import {SettingsDialog} from './settings/purr.settings.dialog';

export const PurrSettingsCard = ({settings, setSettings, connected, setConnected}) => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(() => false);
  const [open, setOpen] = useState(() => false);
  const [attachments, setAttachments] = useState(null);
  const [formErrors, setFormErrors] = useState(() => {});

  const onClose = useCallback(() => setOpen(false), []);
  const onDialogOpen = useCallback(() => setSettingsLoading(true), [connected]);
  const onSubmit = useCallback(formData => {
    setSettings(formData);
    setSubmitLoading(true);
  }, []);
  const onConnect = useCallback(() => setConnecting(true), []);
  const onDisconnect = useCallback(() => setDisconnecting(true), []);

  useEffect(() => {
    if (connecting) {
      const sub$ = connect()
        .pipe(
          catchError(error => {
            console.log(error); // TODO display error
            return of(true);
          }),
          concatMap(() => fetchSettings()),
          catchError(error => {
            console.log(error); // TODO display error
            return of(true);
          }),
          tap(settings => {
            setSettings(settings);
            setConnected(true);
            setConnecting(false);
          })
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    if (disconnecting) {
      const sub$ = disconnect()
        .pipe(
          catchError(error => {
            console.log(error); // TODO display error
            return of(true);
          }),
          tap(() => {
            setConnected(false);
            setSettings({});
            setDisconnecting(false);
          })
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    if (settingsLoading) {
      const sub$ = fetchSettingsAndAttachements()
        .pipe(
          catchError(error => {
            console.log(error); // TODO display error
            return of(true);
          }),
          tap(result => {
            setSettings(result.settings);
            setAttachments(result.attachments);
            setOpen(true);
            setSettingsLoading(false);
          })
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    if (submitLoading) {
      const body = {
        settings: {
          ...settings,
          custom_fields: map(settings.custom_fields, field => field.id),
        },
      };

      const sub$ = saveSettings(body)
        .pipe(
          catchError(error => {
            console.log(error);
            return of(true);
          }), // TODO show error
          tap(result => {
            setSubmitLoading(false);
            if (result.is_valid) {
              setOpen(false);
              setSettings(result.settings);
              // TODO show success card
            } else {
              setFormErrors(result.errors);
            }
          })
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    return () => {};
  }, [connecting, disconnecting, settingsLoading, submitLoading]);

  return (
    <>
      <Card fluid>
        <Card.Content>
          <Card.Header>{connected ? 'Plugin connected' : 'Plugin disconnected'}</Card.Header>
          <Card.Meta>{connected ? settings.api_url : ''}</Card.Meta>
        </Card.Content>

        <Card.Content extra>
          <div className="ui left">
            {connecting || disconnecting || settingsLoading ? (
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
                  onClick={onDialogOpen}
                  loading={settingsLoading}
                  disabled={settingsLoading}
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
        attachments={attachments}
        open={open}
        setOpen={setOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={submitLoading}
        errors={formErrors}
      />
    </>
  );
};
