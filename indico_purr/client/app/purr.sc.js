import React, {useState, useEffect, useCallback} from 'react';
import {Button, Card, Icon} from 'semantic-ui-react';

import {getSettings, download, openSocket, fetchJson, runPhase} from './purr.lib';
import { SettingsDialog } from './settings/purr.settings.dialog';

export const PurrSettingsCard = () => {
  const [settings] = useState(() => getSettings());
  const [loading, setLoading] = useState(() => false);
  const [open, setOpen] = useState(() => false);

  const onSettingsOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onSubmit = useCallback((formState) => console.log(formState), []);
  const onConnect = useCallback(() => console.log('connect'), []);
  const onDisconnect = useCallback(() => console.log(settings), []);

  const isConnected = useCallback(() => !!settings?.connected, []);

  useEffect(() => {
    return () => {};
  }, [settings, loading]);

  return isConnected() ? (
    <>
      <Card fluid>
        <Card.Content>
          <Card.Header>Plugin connected</Card.Header>
          <Card.Meta>{settings.api_url}</Card.Meta>
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
            <Button
              onClick={onSettingsOpen}
              loading={loading}
              disabled={loading}
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
          </div>
        </Card.Content>
      </Card>

      <SettingsDialog settings={settings} open={open} setOpen={setOpen} onClose={onClose} onSubmit={onSubmit} />
    </>
  ) : (
    <Card fluid>
      <Card.Content>
        <Card.Header>Plugin disconnected</Card.Header>
        <Card.Meta>Click "Connect" to configure the PURR API server.</Card.Meta>
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
          <Button
            onClick={onConnect}
            positive
            compact
            size="mini"
            icon="right chevron"
            content="Connect"
          />
        </div>
      </Card.Content>
    </Card>
  );
};
