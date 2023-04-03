import React, {Component} from 'react';
import {Form, Input, Modal, Tab, Button} from 'semantic-ui-react';
import {flow, includes, map, reduce, without} from 'lodash';

// TODO use Grid components to align form fields
export class SettingsDialog extends Component {
  state = {...this.props.settings};

  onFieldChange = (event, field) => {
    this.setState({[field.name]: field.value});
  };

  onFormSubmit = () => {
    // TODO chiamata API per salvare i settings (salvare state)
    // si potrebbe anche gestire tramite props
    console.log(this.state);
    this.props.onSubmit(this.state);
  };

  onDialogClose = () => {
    // reset settings
    this.setState({...this.props.settings});

    this.props.onClose();
  };

  onCustomFieldChange = (event, field) => {
    this.setState({custom_fields: field.value ? [...custom_fields, field.name] : without(custom_fields, field.name)})
  }

  render() {
    const panes = [
      {
        menuItem: 'Abstract Booklet',
        render: () => <AbstractBookletTab />,
      },
      {menuItem: 'PDF Check', render: () => <PDFCheckTab />},
      {menuItem: 'Final proceedings', render: () => <FinalProceedingsTab />},
    ];

    const AbstractBookletTab = () => {
      return (
        <Tab.Pane>
          <Form.Field inline>
            <label>Contribution h1</label>
            <Input
              name="ab_contribution_h1"
              value={this.state.ab_contribution_h1}
              placeholder="Insert contribution h1"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Contribution h2</label>
            <Input
              ame="ab_contribution_h2"
              value={this.state.ab_contribution_h2}
              placeholder="Insert contribution h2"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Session h1</label>
            <Input
              name="ab_session_h1"
              value={this.state.ab_session_h1}
              placeholder="Insert session h1"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Session h2</label>
            <Input
              name="ab_session_h2"
              value={this.state.ab_session_h2}
              placeholder="Insert session h2"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Group grouped >
            <label>Custom Fields</label>
            <CustomFields />
          </Form.Group>
        </Tab.Pane>
      );
    };

    const PDFCheckTab = () => {
      return (
        <Tab.Pane>
          <Form.Field inline>
            <label>PDF Page Height</label>
            <Input
              name="pdf_page_height"
              value={this.state.pdf_page_height}
              placeholder="Insert PDF Page Height"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>PDF Page Width</label>
            <Input
              name="pdf_page_width"
              value={this.state.pdf_page_width}
              placeholder="Insert PDF Page Width"
              onChange={this.onFieldChange}
            />
          </Form.Field>
        </Tab.Pane>
      );
    };

    const FinalProceedingsTab = () => {
      return (
        <Tab.Pane>
          <Form.Field inline>
            <label>DOI Base URL</label>
            <Input
              name="doi_base_url"
              value={this.state.doi_base_url}
              placeholder="Insert DOI Base URL"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>ISBN</label>
            <Input
              name="isbn"
              value={this.state.isbn}
              placeholder="Insert ISBN"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>ISSN</label>
            <Input
              ame="issn"
              value={this.state.issn}
              placeholder="Insert ISSN"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Booktitle short</label>
            <Input
              name="booktitle_short"
              value={this.state.booktitle_short}
              placeholder="Insert booktitle short"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Booktitle long</label>
            <Input
              name="booktitle_long"
              value={this.state.booktitle_long}
              placeholder="Insert booktitle long"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Series</label>
            <Input
              name="series"
              value={this.state.series}
              placeholder="Insert series"
              onChange={this.onFieldChange}
            />
          </Form.Field>
          <Form.Field inline>
            <label>Series number</label>
            <Input
              name="series_number"
              value={this.state.series_number}
              placeholder="Insert series number"
              onChange={this.onFieldChange}
            />
          </Form.Field>
        </Tab.Pane>
      );
    };

    const CustomFields = () => {
      return (
        flow(
          // step 1, checked is true if settings.custom_fields includes the id of the considered contribution field
          fields =>
            map(fields, field => {
              return {...field, checked: includes(this.state?.custom_fields, field.id)};
            }),
          // step 2, map contribution fields to an array of semantic-ui checkboxes
          fields =>
            map(fields, field => (
              <Form.Checkbox
                name={field.id}
                label={field.title}
                value={field.checked}

                control="input"
              />
            )),
          // step 3, concat all checkboxes to create JSX code to be rendered
          jsxElements => reduce(jsxElements, (result, checkbox) => result.concat(checkbox))
        )(this.state.contribution_fields) || <span> No custom field available</span>
      );
    };

    return (
      <Modal open={this.props.open} onClose={this.onDialogClose}>
        <Modal.Header>Settings</Modal.Header>
        <Modal.Content>
          <Form size="small">
            <Tab menu={{fluid: true, vertical: true, tabular: true}} panes={panes} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" onClick={this.onDialogClose} secondary />
          <Button content="Save" onClick={this.onFormSubmit} primary />
        </Modal.Actions>
      </Modal>
    );
  }
}
