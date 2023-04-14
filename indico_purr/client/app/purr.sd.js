import React, {Component, useState} from 'react';
import {Form, Modal, Tab, Button} from 'semantic-ui-react';
import {without} from 'lodash';
import {FinalProceedingsSettings} from './settings/purr.settings.final-proceedings';
import {AbstractBookletSettings} from './settings/purr.settings.abstract-booklet';
import {PDFCheckSettings} from './settings/purr.settings.pdf-check';

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
    this.setState({
      custom_fields: field.value
        ? [...custom_fields, field.name]
        : without(custom_fields, field.name),
    });
  };

  render() {
    const panes = [
      {
        menuItem: 'Abstract Booklet',
        render: () => (
          <AbstractBookletSettings
            formState={this.state}
            onFieldChange={this.onFieldChange}
            onCustomFieldChange={this.onCustomFieldChange}
          />
        ),
      },
      {
        menuItem: 'PDF Check',
        render: () => (
          <PDFCheckSettings formState={this.state} onFieldChange={this.onFieldChange} />
        ),
      },
      {
        menuItem: 'Final proceedings',
        render: () => (
          <FinalProceedingsSettings formState={this.state} onFieldChange={this.onFieldChange} />
        ),
      },
    ];

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
