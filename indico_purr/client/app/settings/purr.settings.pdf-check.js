import React from 'react';
import {Form, Input, Tab} from 'semantic-ui-react';

export function PDFCheckSettings({pdfCheckSettings, updatePDFCheckSetting}) {
  const onFieldChange = (e, field) => updatePDFCheckSetting(field.name, field.value);

  return (
    <Tab.Pane>
      <Form size="small">
        <Form.Field>
          <label>PDF Page Height</label>
          <Input
            name="pdf_page_height"
            value={pdfCheckSettings.pdf_page_height}
            placeholder="Insert PDF Page Height"
            onChange={onFieldChange}
          />
        </Form.Field>
        <Form.Field>
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
