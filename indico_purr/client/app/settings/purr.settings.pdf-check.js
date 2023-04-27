import React, { useCallback } from 'react';
import { Form, Input, Tab, Divider, Message } from 'semantic-ui-react';
import { has } from 'lodash';

export function PDFCheckSettings({ pdfCheckSettings, updatePDFCheckSetting, errors }) {
  const onFieldChange = (e, field) => updatePDFCheckSetting(field.name, field.value);

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field error={hasError('pdf_page_width')}>
          <label>PDF Page Width</label>
          <Input
            name="pdf_page_width"
            value={pdfCheckSettings.pdf_page_width}
            placeholder="Insert PDF Page Width"
            onChange={onFieldChange}
          />
        </Form.Field>

        <Form.Field error={hasError('pdf_page_height')}>
          <label>PDF Page Height</label>
          <Input
            name="pdf_page_height"
            value={pdfCheckSettings.pdf_page_height}
            placeholder="Insert PDF Page Height"
            onChange={onFieldChange}
          />
        </Form.Field>

        <Divider />

        <Message>
          <Message.Header>PDF Check info</Message.Header>
          <Message.Content>Specify page size in points.</Message.Content>
        </Message>
      </Form>
    </Tab.Pane>
  );
}
