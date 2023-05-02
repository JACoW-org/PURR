import React, {useState, useEffect, useCallback} from 'react';
import {isNil} from 'lodash';
import {catchError, filter, finalize, of, tap} from 'rxjs';
import {Button, Card, Icon} from 'semantic-ui-react';
import {connect, disconnect, fetchSettingsAndAttachements, saveSettings} from './api/purr.api';
import {ConnectDialog} from './connect/purr.connect.dialog';

import {SettingsDialog} from './settings/purr.settings.dialog';
import {buildAttachments} from './utils/purr.utils';

export const PurrSettingsCard = ({
  settings,
  setSettings,
  connected,
  setConnected,
  setSettingsValid,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(() => false);
  const [open, setOpen] = useState(() => false);
  const [attachments, setAttachments] = useState(null);
  const [connection, setConnection] = useState({});
  const [connDialogOpen, setConnDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(() => {});

  const onClose = useCallback(() => setOpen(false), []);
  const onDialogOpen = useCallback(() => setSettingsLoading(true));
  const onSubmit = useCallback(formData => {
    setSettings(formData);
    setSubmitLoading(true);
  }, []);
  const onConnect = useCallback(() => setConnecting(true), [connection]);
  const onDisconnect = useCallback(() => setDisconnecting(true), []);

  useEffect(() => {
    if (connecting) {
      const sub$ = connect({connection})
        .pipe(
          catchError(error => {
            console.log(error); // TODO display error
            return of(null);
          }),
          filter(connectResult => !isNil(connectResult)),
          tap(connectResult => {
            if (connectResult.connectionOk) {
              // chiudi modale
              setConnDialogOpen(false);
              setSettings(connectResult.settings);
              setSettingsValid(connectResult.settingsValid)
              setFormErrors({});
              setConnected(true);
            } else {
              setFormErrors(connectResult.errors);
            }
          }),
          finalize(() => setConnecting(false))
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
            setConnection({});
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
            setAttachments(buildAttachments(result.attachments));
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
              setSettingsValid(true);
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
                  onClick={() => setConnDialogOpen(true)}
                  positive
                  compact
                  size="mini"
                  icon="right chevron"
                  content="Connect"
                />
                <ConnectDialog
                  connection={connection}
                  setConnection={setConnection}
                  onConnect={onConnect}
                  open={connDialogOpen}
                  loading={connecting}
                  onClose={() => setConnDialogOpen(false)}
                  errors={formErrors}
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
