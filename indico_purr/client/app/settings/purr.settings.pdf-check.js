import React, { useCallback } from 'react';
import {Form, Input, Tab} from 'semantic-ui-react';
import { has } from 'lodash';

export function PDFCheckSettings({pdfCheckSettings, updatePDFCheckSetting, errors}) {
  const onFieldChange = (e, field) => updatePDFCheckSetting(field.name, field.value);

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field error={hasError('pdf_page_height')}>
          <label>PDF Page Height</label>
          <Input
            name="pdf_page_height"
            value={pdfCheckSettings.pdf_page_height}
            placeholder="Insert PDF Page Height"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field error={hasError('pdf_page_width')}>
          <label>PDF Page Width</label>
          <Input
            name="pdf_page_width"
            value={pdfCheckSettings.pdf_page_width}
            placeholder="Insert PDF Page Width"
            onChange={onFieldChange}
          />
        </Form.Field>
      </Form>
    </Tab.Pane>
  );
}
