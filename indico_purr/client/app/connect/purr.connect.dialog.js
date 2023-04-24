import {has} from 'lodash';
import React, {useCallback} from 'react';
import {Button, Form, Icon, Input, Modal} from 'semantic-ui-react';

export function ConnectDialog({
  connection,
  setConnection,
  onConnect,
  open,
  onClose,
  loading,
  errors,
}) {
  const onFieldChange = (e, field) => setConnection({...connection, [field.name]: field.value});

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>Connection to PURR</Modal.Header>
      <Modal.Content>
        {loading ? (
          <div>
            <Icon loading name="spinner" />
            Processing...
          </div>
        ) : (
          <Form size="small">
            <Form.Field error={hasError('api_url')}>
              <label>API Url</label>
              <Input
                name="api_url"
                value={connection?.api_url || ''}
                placeholder="Insert API URL"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field error={hasError('api_key')}>
              <label>API Key</label>
              <Input
                name="api_key"
                value={connection?.api_key || ''}
                placeholder="Insert API key"
                onChange={onFieldChange}
              />
            </Form.Field>
          </Form>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={onClose} secondary />
        <Button content="Save" onClick={onConnect} primary />
      </Modal.Actions>
    </Modal>
  );
}
