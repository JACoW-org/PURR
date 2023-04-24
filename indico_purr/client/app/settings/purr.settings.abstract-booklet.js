import React, {useCallback} from 'react';
import {find, flow, has, includes, map, reduce, remove, tap, without} from 'lodash';
import {Checkbox, Form, Input, Tab} from 'semantic-ui-react';

export function AbstractBookletSettings({abSettings, updateABSetting, errors}) {
  const onFieldChange = (e, field) => updateABSetting(field.name, field.value);

  const onCustomFieldChange = (e, field) => {
    const custom_fields = field.checked ? [...abSettings.custom_fields, +field.name] : without(abSettings.custom_fields, +field.name);
    updateABSetting('custom_fields', custom_fields);
  };

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field error={hasError('ab_contribution_h1')}>
          <label>Contribution h1</label>
          <Input
            name="ab_contribution_h1"
            value={abSettings.ab_contribution_h1 || ''}
            placeholder="Insert contribution h1"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field error={hasError('ab_contribution_h2')}>
          <label>Contribution h2</label>
          <Input
            name="ab_contribution_h2"
            value={abSettings.ab_contribution_h2 || ''}
            placeholder="Insert contribution h2"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field error={hasError('ab_session_h1')}>
          <label>Session h1</label>
          <Input
            name="ab_session_h1"
            value={abSettings.ab_session_h1 || ''}
            placeholder="Insert session h1"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field error={hasError('ab_session_h2')}>
          <label>Session h2</label>
          <Input
            name="ab_session_h2"
            value={abSettings.ab_session_h2 || ''}
            placeholder="Insert session h2"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Group grouped>
          <label>Custom Fields</label>
          <CustomFields
            custom_fields={abSettings.custom_fields}
            contribution_fields={abSettings.contribution_fields}
            onCustomFieldChange={onCustomFieldChange}
          />
        </Form.Group>
      </Form>
    </Tab.Pane>
  );
}

function CustomFields({custom_fields, contribution_fields, onCustomFieldChange}) {

  return (
    flow(
      // step 1, checked is true if custom_fields includes the id of the considered contribution field
      fields =>
        map(fields, field => {
          return {...field, checked: !!includes(custom_fields, field.id)}
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
