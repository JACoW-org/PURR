import React, {useEffect} from 'react';
import {useState} from 'react';
import {Button, Icon, Modal, Tab} from 'semantic-ui-react';
import {isEmpty, pick} from 'lodash';

import {AbstractBookletSettings} from './purr.settings.abstract-booklet';
import {FinalProceedingsSettings} from './purr.settings.final-proceedings';
import {PDFCheckSettings} from './purr.settings.pdf-check';
import {PurrErrorAlert} from '../purr.error.alert';

export function SettingsDialog({
  settings,
  materials,
  errors,
  open,
  setOpen,
  onSubmit,
  loading,
  errorMessage,
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isEmpty(errorMessage)) {
      // no error --> don't display any error
      return;
    }

    setShowError(true);
  }, [errorMessage]);

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
    'primary_color',
    'booktitle_short',
    'booktitle_long',
    'series',
    'series_number',
    'pre_print',
    'copyright_year',
    'site_license_text',
    'site_license_url',
    'paper_license_icon_url',
    'paper_license_text',
    'location',
    'host_info',
    'editorial_board',
    'editorial_json',
    'doi_env',
    'doi_proto',
    'doi_domain',
    'doi_context',
    'doi_organization',
    'doi_conference',
    'doi_user',
    'doi_password',
    'date',
    'toc_grouping',
    'materials',
    'duplicate_of_alias',
    'cat_publish_alias'
  ]);

  const [abSettings, setABSettings] = useState(() => defaultABSettings);
  const [pdfCheckSettings, setPDFCheckSettings] = useState(() => defaultPDFCheckSettings);
  const [finalProcSettings, setFinalProcSettings] = useState(() => defaultFinalProcSettings);

  const updateABSetting = (key, value) => setABSettings({...abSettings, [key]: value});
  const updatePDFCheckSetting = (key, value) =>
    setPDFCheckSettings({...pdfCheckSettings, [key]: value});
  const updateFinalProcSettings = (key, value) =>
    setFinalProcSettings({...finalProcSettings, [key]: value});

  const onFormSubmit = () => {
    onSubmit({
      ...pick(abSettings, [
        'ab_contribution_h1',
        'ab_contribution_h2',
        'ab_session_h1',
        'ab_session_h2',
        'custom_fields',
      ]),
      ...pdfCheckSettings,
      ...finalProcSettings,
    });
  };

  const panes = [
    {
      menuItem: 'Abstract Booklet',
      render: () => (
        <AbstractBookletSettings
          abSettings={abSettings}
          updateABSetting={updateABSetting}
          errors={errors}
        />
      ),
    },
    {
      menuItem: 'PDF Check',
      render: () => (
        <PDFCheckSettings
          pdfCheckSettings={pdfCheckSettings}
          updatePDFCheckSetting={updatePDFCheckSetting}
          errors={errors}
        />
      ),
    },
    {
      menuItem: 'Final proceedings',
      render: () => (
        <FinalProceedingsSettings
          finalProcSettings={finalProcSettings}
          updateFinalProcSettings={updateFinalProcSettings}
          materials={materials}
          errors={errors}
          contributionFields={settings?.contribution_fields}
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
    <Modal size="large" open={open} onClose={onDialogClose}>
      <Modal.Header>Settings</Modal.Header>
      <Modal.Content scrolling>
        {loading ? (
          <div>
            <Icon loading name="spinner" />
            Processing...
          </div>
        ) : (
          <Tab menu={{fluid: true, vertical: true, tabular: true}} panes={panes} />
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={onDialogClose} secondary />
        <Button content="Save" onClick={onFormSubmit} primary />
      </Modal.Actions>
      <PurrErrorAlert
        message={errorMessage}
        open={showError}
        setOpen={setShowError}
      ></PurrErrorAlert>
    </Modal>
  );
}
