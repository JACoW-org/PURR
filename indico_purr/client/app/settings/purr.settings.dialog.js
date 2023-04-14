import React from 'react';
import {useState} from 'react';
import {Button, Modal, Tab} from 'semantic-ui-react';
import {pick} from 'lodash';

import {AbstractBookletSettings} from './purr.settings.abstract-booklet';
import {FinalProceedingsSettings} from './purr.settings.final-proceedings';
import {PDFCheckSettings} from './purr.settings.pdf-check';

export function SettingsDialog({settings, open, setOpen, onSubmit}) {
// TODO refactor as const array
  const defaultABSettings = pick(settings, [
    'ab_contribution_h1',
    'ab_contribution_h2',
    'ab_session_h1',
    'ab_session_h2',
    'custom_fields',
    'contribution_fields',
  ]);

  const defaultPDFCheckSettings = pick(settings, ['pdf_page_height', 'pdf_page_width']);

  const defaultFinalProcSettings = pick(settings, [
    'isbn',
    'issn',
    'booktitle_short',
    'booktitle_long',
    'series',
    'series_number',
    'location',
    'hostInfo',
    'editorialBoard',
  ]);

  const [abSettings, setABSettings] = useState(() => defaultABSettings);
  const [pdfCheckSettings, setPDFCheckSettings] = useState(() => defaultPDFCheckSettings);
  const [finalProcSettings, setFinalProcSettings] = useState(() => defaultFinalProcSettings);

  const onFormSubmit = () => {
    onSubmit({
      ...abSettings,
      ...pdfCheckSettings,
      ...finalProcSettings,
    });
  };

  const panes = [
    {
      menuItem: 'Abstract Booklet',
      render: () => (
        <AbstractBookletSettings abSettings={abSettings} setABSettings={setABSettings} />
      ),
    },
    {
      menuItem: 'PDF Check',
      render: () => (
        <PDFCheckSettings
          pdfCheckSettings={pdfCheckSettings}
          setPDFCheckSettings={setPDFCheckSettings}
        />
      ),
    },
    {
      menuItem: 'Final proceedings',
      render: () => (
        <FinalProceedingsSettings
          finalProcSettings={finalProcSettings}
          setFinalProcSettings={setFinalProcSettings}
        />
      ),
    },
  ];

  const onDialogClose = () => {
    setOpen(false);
    setABSettings(defaultABSettings);
    setPDFCheckSettings(defaultPDFCheckSettings);
    setFinalProcSettings(defaultFinalProcSettings);
  };

  return (
    <Modal open={open} onClose={onDialogClose}>
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content>
        <Tab menu={{fluid: true, vertical: true, tabular: true}} panes={panes} />
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={onDialogClose} secondary />
        <Button content="Save" onClick={onFormSubmit} primary />
      </Modal.Actions>
    </Modal>
  );
}
