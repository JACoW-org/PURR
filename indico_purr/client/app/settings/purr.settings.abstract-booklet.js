import React from 'react';
import {flow, includes, map, reduce, without} from 'lodash';
import {Form, Input, Tab} from 'semantic-ui-react';

export function AbstractBookletSettings({abSettings, setABSettings}) {
  const onFieldChange = (e, field) => {
    setABSettings({...abSettings, [field.name]: field.value});
  };

  const onCustomFieldChange = (e, field) => {
    const custom_fields = field.value
      ? [...abSettings.custom_fields, field.name]
      : without(...abSettings.custom_fields, field.name);
    setABSettings({...abSettings, custom_fields});
  };

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field>
          <label>Contribution h1</label>
          <Input
            name="ab_contribution_h1"
            value={abSettings.ab_contribution_h1 || ''}
            placeholder="Insert contribution h1"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Contribution h2</label>
          <Input
            name="ab_contribution_h2"
            value={abSettings.ab_contribution_h2 || ''}
            placeholder="Insert contribution h2"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Session h1</label>
          <Input
            name="ab_session_h1"
            value={abSettings.ab_session_h1 || ''}
            placeholder="Insert session h1"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field>
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
          <CustomFields abSettings={abSettings} onCustomFieldChange={onCustomFieldChange} />
        </Form.Group>
      </Form>
    </Tab.Pane>
  );
}

function CustomFields({abSettings, onCustomFieldChange}) {
  return (
    flow(
      // step 1, checked is true if settings.custom_fields includes the id of the considered contribution field
      fields =>
        map(fields, field => {
          return {...field, checked: includes(abSettings.custom_fields, field.id)};
        }),
      // step 2, map contribution fields to an array of semantic-ui checkboxes
      fields =>
        map(fields, field => (
          <Form.Checkbox
            name={field.id}
            label={field.title}
            value={field.checked}
            control="input"
            onChange={onCustomFieldChange}
          />
        )),
      // step 3, concat all checkboxes to create JSX code to be rendered
      jsxElements => reduce(jsxElements, (result, checkbox) => result.concat(checkbox))
    )(abSettings.contribution_fields) || <span> No custom field available</span>
  );
}
