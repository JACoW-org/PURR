import React, { useCallback } from 'react';
import { find, flow, has, includes, map, reduce, remove, tap, without } from 'lodash';
import { Checkbox, Form, Input, Tab, Message, Divider } from 'semantic-ui-react';

export function AbstractBookletSettings({ abSettings, updateABSetting, errors }) {
  const onFieldChange = (e, field) => updateABSetting(field.name, field.value);

  const onCustomFieldChange = (e, field) => {
    const custom_fields = field.checked ? [...abSettings.custom_fields, +field.name] : without(abSettings.custom_fields, +field.name);
    updateABSetting('custom_fields', custom_fields);
  };

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field error={hasError('ab_session_h1')}>
          <label>Session Header 1</label>
          <Input
            name="ab_session_h1"
            value={abSettings.ab_session_h1 || ''}
            placeholder="Insert session h1"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field error={hasError('ab_session_h2')}>
          <label>Session Header 2</label>
          <Input
            name="ab_session_h2"
            value={abSettings.ab_session_h2 || ''}
            placeholder="Insert session h2"
            onChange={onFieldChange}
          />
        </Form.Field>

        <Divider />

        <Form.Field error={hasError('ab_contribution_h1')}>
          <label>Contribution Header</label>
          <Input
            name="ab_contribution_h1"
            value={abSettings.ab_contribution_h1 || ''}
            placeholder="Insert contribution h1"
            onChange={onFieldChange}
          />
        </Form.Field>

        <Form.Field error={hasError('ab_contribution_h2')}>
          <label>Contribution Header (Poster)</label>
          <Input
            name="ab_contribution_h2"
            value={abSettings.ab_contribution_h2 || ''}
            placeholder="Insert contribution h2"
            onChange={onFieldChange}
          />
        </Form.Field>

        <Divider />

        <Form.Group grouped>
          <label>Custom Fields</label>
          <CustomFields
            custom_fields={abSettings.custom_fields}
            contribution_fields={abSettings.contribution_fields}
            onCustomFieldChange={onCustomFieldChange}
          />
        </Form.Group>

        <Divider />

        <Message>
          <Message.Header>Placeholders to be used for headers</Message.Header>
          <Message.List>
            <Message.Item><b>&#123;code&#125;</b>: for the Session/Contribution <i>Code</i></Message.Item>
            <Message.Item><b>&#123;title&#125;</b>: for the Session/Contribution <i>Title</i></Message.Item>
            <Message.Item><b>&#123;start&#125;</b>: for the Session/Contribution <i>Start date</i></Message.Item>
            <Message.Item><b>&#123;end&#125;</b>: for the Session/Contribution <i>End date</i></Message.Item>
            <Message.Item><b>|</b> (pipe): for <i>Table</i> (es. | &#123;code&#125; | / | &#123;start&#125; |)</Message.Item>
          </Message.List>
        </Message>
      </Form>
    </Tab.Pane>
  );
}

function CustomFields({ custom_fields, contribution_fields, onCustomFieldChange }) {

  return (
    flow(
      // step 1, checked is true if custom_fields includes the id of the considered contribution field
      fields =>
        map(fields, field => {
          return { ...field, checked: !!includes(custom_fields, field.id) }
        }),
      // step 2, map contribution fields to an array of semantic-ui checkboxes
      fields =>
        map(fields, field => (
          <Form.Field key={`custom_form_field_${field.id}`}>
            <Checkbox
              key={`custom_field_${field.id}`}
              name={`${field.id}`}
              label={field.title}
              checked={field.checked}
              onChange={onCustomFieldChange}
            />
          </Form.Field>
        ))
    )(contribution_fields) || <span> No custom field available</span>
  );
}
