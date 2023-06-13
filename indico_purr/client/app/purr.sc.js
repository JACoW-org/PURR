import React, {useState, useEffect, useCallback} from 'react';
import {isNil} from 'lodash';
import {catchError, filter, finalize, of, switchMap, tap} from 'rxjs';
import {Button, Card, Icon} from 'semantic-ui-react';
import {connect, disconnect, fetchSettingsAndAttachements, saveSettings} from './api/purr.api';
import {ConnectDialog} from './connect/purr.connect.dialog';

import {SettingsDialog} from './settings/purr.settings.dialog';
import {buildAttachments} from './utils/purr.utils';
import {PurrErrorAlert} from './purr.error.alert';

export const PurrSettingsCard = ({
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
  const [attachments, setAttachments] = useState(null);
  const [connection, setConnection] = useState({});
  const [connDialogOpen, setConnDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState(() => {});
  const [settingsErrorMessage, setSettingsErrorMessage] = useState(null);
  const [connErrorMessage, setConnErrorMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);

  const onClose = useCallback(() => setOpen(false), []);
  const onDialogOpen = useCallback(() => setSettingsLoading(true));
  const onSubmit = useCallback(formData => {
    setSettings(formData);
    setSubmitLoading(true);
  }, []);
  const onConnect = useCallback(() => setConnecting(true), [connection]);
  const onDisconnect = useCallback(() => setDisconnecting(true), []);

  // update value of processing
  useEffect(() => {
    setProcessing(connecting || disconnecting || settingsLoading || submitLoading);
    return () => {};
  }, [connecting, disconnecting, settingsLoading, submitLoading]);

  useEffect(() => {
    if (connecting) {
      const sub$ = of(null)
        .pipe(
          tap(() => setConnErrorMessage(null)),
          switchMap(() => connect({connection})),
          catchError(error => {
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
            setErrorMessage('Could not disconnect from plugin.');
            setShowError(true);
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
            setErrorMessage('Could not fetch settings.');
            setShowError(true);
            return of(null);
          }),
          filter(result => !isNil(result)),
          tap(result => {
            setSettings(result.settings);
            setAttachments(buildAttachments(result.attachments));
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
            setSettingsErrorMessage('Something occured while attempting to save the settings!');
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
                  disabled={processing}
                  primary
                  compact
                  size="mini"
                >
                  <Icon name="settings" />
                </Button>
                <Button
                  disabled={processing}
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
        attachments={attachments}
        open={open}
        setOpen={setOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={submitLoading}
        errors={formErrors}
        errorMessage={settingsErrorMessage}
      />
      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
    </>
  );
};
