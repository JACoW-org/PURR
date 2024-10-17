import React, { useState, useEffect, useCallback } from 'react';
import { isNil, result } from 'lodash';
import { catchError, concatMap, filter, finalize, of, switchMap, tap } from 'rxjs';
import { Button, Card, Icon, Modal } from 'semantic-ui-react';
import { clearFolders, connect, disconnect, fetchPing, fetchSettingsAndAttachements, saveSettings } from './api/purr.api';
import { ConnectDialog } from './connect/purr.connect.dialog';

import { SettingsDialog } from './settings/purr.settings.dialog';
import { PurrErrorAlert } from './purr.error.alert';
import { useError } from './contexts/ErrorProvider';

export const PurrSettingsCard = ({
  eventId,
  settings,
  setSettings,
  connected,
  setConnected,
  setSettingsValid,
  processing,
  setProcessing,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(() => false);
  const [open, setOpen] = useState(() => false);
  const [materials, setMaterials] = useState(null);
  const [connection, setConnection] = useState({});
  const [connDialogOpen, setConnDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(() => { });
  const [settingsErrorMessage, setSettingsErrorMessage] = useState(null);
  const [connErrorMessage, setConnErrorMessage] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(() => false);
  const [clearing, setClearing] = useState(() => false);

  const onClose = useCallback(() => setOpen(false), []);
  const onDialogOpen = useCallback(() => setSettingsLoading(true));
  const onSubmit = useCallback(formData => {
    setSettings(formData);
    setSubmitLoading(true);
  }, []);
  const onConnect = useCallback(() => setConnecting(true), [connection]);
  const onDisconnect = useCallback(() => setDisconnecting(true), []);
  const onClear = useCallback(() => setClearDialogOpen(true), []);

  const { handleError } = useError();

  // update value of processing
  useEffect(() => {
    setProcessing(connecting || disconnecting || settingsLoading || submitLoading);
    return () => { };
  }, [connecting, disconnecting, settingsLoading, submitLoading]);

  useEffect(() => {
    if (connecting) {
      const sub$ = of(null)
        .pipe(
          tap(() => setConnErrorMessage(null)),
          concatMap(() => fetchPing(connection.api_url, connection.api_key)),
          tap(result => {
            if (!result.error) {
              return;
            }

            const error = result;
            if (error.status === 401) {
              handleError({ message: 'Connection to MEOW failed. Please set a valid API key.' });
            }
            handleError({ message: 'Connection to MEOW failed. Please set a valid API URL' });
            setConnDialogOpen(false);
            setConnected(false);
            throw new Error(error.message);
          }),
          catchError(() => of(null)),
          filter(result => !!result),
          concatMap(() => connect({ connection })),
          catchError(() => {
            setConnErrorMessage('Could not connect to plugin.');
            return of(null);
          }),
          filter(connectResult => !isNil(connectResult)),
          tap(connectResult => {
            if (connectResult.connectionOk) {
              // close modal
              setConnDialogOpen(false);
              setSettings(connectResult.settings);
              setSettingsValid(connectResult.settingsValid);
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
            handleError({ message: 'Could not disconnect from plugin.' });
            return of(null);
          }),
          filter(result => !isNil(result)),
          tap(() => {
            setConnected(false);
            setSettings({});
            setConnection({});
          }),
          finalize(() => setDisconnecting(false))
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    if (settingsLoading) {
      const sub$ = fetchSettingsAndAttachements()
        .pipe(
          catchError(error => {
            handleError({ message: 'Could not fetch settings.' });
            return of(null);
          }),
          filter(result => !isNil(result)),
          tap(result => {
            setSettings(result.settings);
            setMaterials(result.attachments);
            setOpen(true);
          }),
          finalize(() => setSettingsLoading(false))
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

      const sub$ = of(null)
        .pipe(
          tap(() => setSettingsErrorMessage(null)),
          switchMap(() => saveSettings(body)),
          catchError(error => {
            setSettingsErrorMessage('An error occured while attempting to save the settings!');
            return of(null);
          }),
          filter(result => !isNil(result)),
          tap(result => {
            if (result.is_valid) {
              setOpen(false);
              setSettings(result.settings);
              setSettingsValid(true);
              // TODO show success card
            } else {
              setFormErrors(result.errors);
            }
          }),
          finalize(() => setSubmitLoading(false))
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    return () => { };
  }, [connecting, disconnecting, settingsLoading, submitLoading]);

  useEffect(() => {
    if (clearing) {
      const sub$ = of(null)
        .pipe(
          switchMap(() => clearFolders(settings.api_url, eventId, settings.api_key)),
          catchError(error => {
            setClearDialogOpen(false);
            setSettingsErrorMessage('An error occured while attempting to clear MEOW folders');
            return of(null);
          }),
          filter(result => !!result),
          tap(result => {
            if (result?.status === 'success') {
              // setClearDialogOpen(false);
              window.location.reload();
            }
          }),
          finalize(() => setClearing(false))
        )
        .subscribe();

      return () => sub$.unsubscribe();
    }

    return () => { };
  }, [clearing])

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
                  disabled={processing || clearing}
                  primary
                  compact
                  size="mini"
                  title='Manage settings'
                >
                  <Icon name="settings" />
                </Button>
                <Button
                  onClick={onClear}
                  loading={clearing}
                  disabled={processing}
                  primary
                  compact
                  size="mini"
                  title='Clear MEOW folders'
                  negative
                >
                  <Icon name="erase" />
                </Button>
                <Button
                  disabled={processing || clearing}
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
                  disabled={processing}
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
                  errorMessage={connErrorMessage}
                />
              </>
            )}
          </div>
        </Card.Content>
      </Card>
      <SettingsDialog
        settings={settings}
        materials={materials}
        open={open}
        setOpen={setOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={submitLoading}
        errors={formErrors}
        errorMessage={settingsErrorMessage}
      />
      <Modal open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <Modal.Header>Clear MEOW folders</Modal.Header>
        <Modal.Content>
          <p>Are you really sure to clear all the folders for this event in MEOW?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='grey' onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button color='red' onClick={() => setClearing(true)}>
            Clear
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};
