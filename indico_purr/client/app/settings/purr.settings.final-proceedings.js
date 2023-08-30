import React, {useCallback, useEffect, useState} from 'react';
import {
  Accordion,
  Button,
  Dropdown,
  Form,
  Icon,
  Input,
  Message,
  Modal,
  Select,
  Tab,
  Table,
  TextArea,
} from 'semantic-ui-react';
import {has} from 'lodash';

export function FinalProceedingsSettings({
  finalProcSettings,
  updateFinalProcSettings,
  materials,
  errors,
  contributionFields,
}) {
  const doiApiEnvOptions = [
    {key: 'test', text: 'Test', value: 'test'},
    {key: 'prod', text: 'Production', value: 'prod'},
  ];
  const tocOptions = [
    {key: 'session', text: 'Session', value: 'session'},
    {key: 'contribution', text: 'Contribution', value: 'contribution'},
  ];

  const [activeIndex, setActiveIndex] = useState(() => 0);
  const [contribFields, setContribFields] = useState(() => []);

  const onClick = useCallback(
    (e, titleProps) => {
      const {index} = titleProps;
      setActiveIndex(activeIndex === index ? -1 : index);
    },
    [activeIndex]
  );

  const onFieldChange = (e, field) => updateFinalProcSettings(field.name, field.value);

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

  useEffect(() => {
    if (contributionFields) {
      setContribFields(
        contributionFields.map((field, index) => ({
          key: `field-${index}`,
          value: field.title,
          text: field.title,
        }))
      );
    }

    return () => {};
  }, [contributionFields]);

  return (
    <Tab.Pane>
      <Form size="small">
        <Accordion fluid styled>
          <Accordion.Title active={activeIndex === 0} index={0} onClick={onClick}>
            <Icon name="dropdown" />
            General
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <Form.Group>
              <Form.Field error={hasError('location')} width="8">
                <label>Location</label>
                <Input
                  name="location"
                  value={finalProcSettings.location || ''}
                  placeholder="Insert location"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('date')} width="8">
                <label>Date</label>
                <Input
                  name="date"
                  value={finalProcSettings.date || ''}
                  placeholder="Insert event date"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field error={hasError('booktitle_short')} width="6">
                <label>Booktitle short</label>
                <Input
                  name="booktitle_short"
                  value={finalProcSettings.booktitle_short || ''}
                  placeholder="Insert booktitle short"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('booktitle_long')} width="12">
                <label>Booktitle long</label>
                <Input
                  name="booktitle_long"
                  value={finalProcSettings.booktitle_long || ''}
                  placeholder="Insert booktitle long"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field error={hasError('series_number')} width="6">
                <label>Series number</label>
                <Input
                  name="series_number"
                  value={finalProcSettings.series_number || ''}
                  placeholder="Insert series number"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('series')} width="12">
                <label>Series</label>
                <Input
                  name="series"
                  value={finalProcSettings.series || ''}
                  placeholder="Insert series"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field error={hasError('series')} width="16">
                <label>Pre print</label>
                <Input
                  name="pre_print"
                  value={finalProcSettings.pre_print || ''}
                  placeholder="Insert pre print"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 1} index={1} onClick={onClick}>
            <Icon name="dropdown" />
            Extra
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <Form.Field error={hasError('primary_color')} width="16">
              <label>Primary color</label>
              <Input
                name="primary_color"
                value={finalProcSettings.primary_color || ''}
                placeholder="Primary color"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field error={hasError('host_info')} width="16">
              <label>Host info</label>
              <TextArea
                name="host_info"
                value={finalProcSettings.host_info || ''}
                placeholder="Add host info (you can use markdown)"
                rows={3}
                onChange={onFieldChange}
              />
              <div className="center icon-arrow-up instructions">
                You can use <b>Markdown</b>.
              </div>
            </Form.Field>
            <Form.Field error={hasError('editorial_board')} width="16">
              <label>Editorial Board</label>
              <TextArea
                name="editorial_board"
                value={finalProcSettings.editorial_board || ''}
                placeholder="Add editorial board"
                rows={3}
                onChange={onFieldChange}
              />
              <div className="center icon-arrow-up instructions">
                You can use <b>Markdown</b>.
              </div>
            </Form.Field>
            <Form.Field error={hasError('editorial_json')} width="16">
              <label>Editorial JSON</label>
              <TextArea
                name="editorial_json"
                value={finalProcSettings.editorial_json || ''}
                placeholder="Add editorial json"
                rows={3}
                onChange={onFieldChange}
              />
              <div className="center icon-arrow-up instructions">
                You have to use <b>JSON</b>.
              </div>
            </Form.Field>
            <Form.Group widths="equal">
              <Form.Field>
                <label>duplicate_of alias</label>
                <Select
                  placeholder="Select the alias for 'duplicate_of' field contribution field"
                  options={contribFields}
                  value={finalProcSettings?.duplicate_of_alias || ''}
                  name="duplicate_of_alias"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field>
                <label>CAT_publish alias</label>
                <Select
                  placeholder="Select the alias for 'CAT_publish' field contribution field"
                  options={contribFields}
                  value={finalProcSettings?.cat_publish_alias || ''}
                  name="cat_publish_alias"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 2} index={2} onClick={onClick}>
            <Icon name="dropdown" />
            Identifiers
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Form.Group>
              <Form.Field error={hasError('isbn')} width="8">
                <label>ISBN</label>
                <Input
                  name="isbn"
                  value={finalProcSettings.isbn || ''}
                  placeholder="Insert ISBN"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('issn')} width="8">
                <label>ISSN</label>
                <Input
                  name="issn"
                  value={finalProcSettings.issn || ''}
                  placeholder="Insert ISSN"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 3} index={3} onClick={onClick}>
            <Icon name="dropdown" />
            DOI
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 3}>
            <Form.Group widths="equal">
              <Form.Field error={hasError('doi_env')}>
                <label>DOI API ENV</label>
                <Select
                  fluid
                  placeholder="Select an API environment"
                  options={doiApiEnvOptions}
                  value={finalProcSettings.doi_env || ''}
                  name="doi_env"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('doi_proto')}>
                <label>DOI URL Protocol</label>
                <Input
                  fluid
                  name="doi_proto"
                  value={finalProcSettings.doi_proto || ''}
                  placeholder="Insert DOI URL protocol"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('doi_domain')}>
                <label>DOI URL Domain</label>
                <Input
                  fluid
                  name="doi_domain"
                  value={finalProcSettings.doi_domain || ''}
                  placeholder="Insert DOI URL domain"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('doi_context')}>
                <label>DOI URL Context</label>
                <Input
                  fluid
                  name="doi_context"
                  value={finalProcSettings.doi_context || ''}
                  placeholder="Insert DOI URL context"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field error={hasError('doi_organization')}>
                <label>DOI Organization</label>
                <Input
                  fluid
                  name="doi_organization"
                  value={finalProcSettings.doi_organization || ''}
                  placeholder="Insert DOI URL organization segment (e.g. JACoW)"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('doi_conference')}>
                <label>DOI Conference</label>
                <Input
                  fluid
                  name="doi_conference"
                  value={finalProcSettings.doi_conference || ''}
                  placeholder="Insert DOI URL conference code (e.g. IPAC-24)"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field error={hasError('doi_user')}>
                <label>DOI User</label>
                <Input
                  fluid
                  name="doi_user"
                  value={finalProcSettings.doi_user || ''}
                  placeholder="Insert DOI user"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('doi_password')}>
                <label>DOI Password</label>
                <Input
                  fluid
                  name="doi_password"
                  value={finalProcSettings.doi_password || ''}
                  placeholder="Insert DOI Password"
                  onChange={onFieldChange}
                  type="password"
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 4} index={4} onClick={onClick}>
            <Icon name="dropdown" />
            Materials
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 4}>
            <Materials
              materials={materials}
              finalProcSettings={finalProcSettings}
              updateFinalProcSettings={updateFinalProcSettings}
            />
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 5} index={5} onClick={onClick}>
            <Icon name="dropdown" />
            Table of contents
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 5}>
            <Form.Field>
              <label>Group by</label>
              <Dropdown
                name="toc_grouping"
                value={finalProcSettings.toc_grouping || []}
                onChange={onFieldChange}
                placeholder="Select one or more options"
                fluid
                multiple
                selection
                options={tocOptions}
              />
            </Form.Field>
          </Accordion.Content>
        </Accordion>
      </Form>
    </Tab.Pane>
  );
}

export function Materials({materials, finalProcSettings, updateFinalProcSettings}) {
  const [materialsMap, setMaterialsMap] = useState(
    () =>
      new Map([
        ['logo', []],
        ['poster', []],
        ['final-proceedings-cover', []],
        ['at-a-glance-cover', []],
        ['volumes', []],
        ['attachments', []],
      ])
  );
  const [isEmpty, setIsEmpty] = useState(() => true);
  const [open, setOpen] = useState(() => false);
  const [addFormState, setAddFormState] = useState(() => ({
    controls: {
      fileID: {value: null, valid: false, dirty: false},
      section: {value: null, valid: false, dirty: false},
    },
    valid: false,
    dirty: false,
    errorMessage: null,
  }));

  const resetFormState = useCallback(
    () =>
      setAddFormState({
        controls: {
          fileID: {value: null, valid: false, dirty: false},
          section: {value: null, valid: false, dirty: false},
        },
        valid: false,
        dirty: false,
        errorMessage: null,
      }),
    []
  );

  const onDelete = useCallback(
    fileID => {
      updateFinalProcSettings(
        'materials',
        finalProcSettings.materials.filter(material => material.id !== fileID)
      );
    },
    [finalProcSettings]
  );

  const onMoveUp = useCallback(
    (section, index) => {
      const newIndex = index - 1;

      updateFinalProcSettings(
        'materials',
        finalProcSettings.materials.map(material => {
          if (material.section === section) {
            if (material.index === index) {
              material.index = newIndex;
            } else if (material.index === newIndex) {
              material.index = index;
            }
          }
          return material;
        })
      );
    },
    [finalProcSettings]
  );

  const onMoveDown = useCallback(
    (section, index) => {
      const newIndex = index + 1;

      updateFinalProcSettings(
        'materials',
        finalProcSettings.materials.map(material => {
          if (material.section === section) {
            if (material.index === index) {
              material.index = newIndex;
            } else if (material.index === newIndex) {
              material.index = index;
            }
          }
          return material;
        })
      );
    },
    [finalProcSettings]
  );

  const onAddNew = useCallback(() => {
    const fileID = addFormState.controls.fileID.value;
    const section = addFormState.controls.section.value;

    // validation ==> logo and poster can have at most one file
    if (
      section === 'logo' ||
      section === 'poster' ||
      section === 'final-proceedings-cover' ||
      section === 'at-a-glance-cover'
    ) {
      if (materialsMap.get(section).length !== 0) {
        const message = `Cannot add more materials to section ${section}`;
        setAddFormState(prevState => ({...prevState, valid: false, errorMessage: message}));

        return;
      }
    }

    // check duplicate
    for (const material of materialsMap.get(section)) {
      if (material.id === fileID) {
        const message = `Impossible to add this material again in section ${section}`;
        setAddFormState(prevState => ({...prevState, valid: false, errorMessage: message}));

        return;
      }
    }

    const sectionNextIndex = materialsMap.get(section).length;

    updateFinalProcSettings('materials', [
      ...finalProcSettings.materials,
      {id: fileID, section: section, index: sectionNextIndex},
    ]);

    setOpen(false);
  }, [materials, finalProcSettings.materials, addFormState]);

  useEffect(() => {
    setIsEmpty(finalProcSettings.materials.length === 0);

    const map = finalProcSettings.materials
      .map(material => ({
        ...materials.find(_material => _material.id === material.id),
        section: material.section,
        index: material.index,
      })) // map to object with all properties
      .filter(material => !!material) // filter undefined
      .reduce((acc, material) => {
        if (acc.has(material.section)) {
          acc.get(material.section).push(material);
        }
        return acc;
      }, new Map([
        ['logo', []],
        ['poster', []],
        ['final-proceedings-cover', []],
        ['at-a-glance-cover', []],
        ['volumes', []],
        ['attachments', []]
      ])); // produce a Map object for fast access

    setMaterialsMap(map);

    return () => {};
  }, [finalProcSettings.materials, materials]);

  useEffect(() => {
    if (!open) {
      resetFormState();
    }

    return () => {};
  }, [open]);

  return (
    <>
      <Table celled structured striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Section</Table.HeaderCell>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {/* Logo */}
          {materialsMap.get('logo').length > 0 ? (
            <Table.Row>
              <Table.Cell>Logo</Table.Cell>
              <Table.Cell>{materialsMap.get('logo')[0].title}</Table.Cell>
              <Table.Cell>
                <Button icon onClick={() => onDelete(materialsMap.get('logo')[0].id)}>
                  <Icon name="delete" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : null}

          {/* Poster */}
          {materialsMap.get('poster').length > 0 ? (
            <Table.Row>
              <Table.Cell>Poster</Table.Cell>
              <Table.Cell>{materialsMap.get('poster')[0].title}</Table.Cell>
              <Table.Cell>
                <Button icon onClick={() => onDelete(materialsMap.get('poster')[0].id)}>
                  <Icon name="delete" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : null}

          {/* Final Proceedings Cover */}
          {materialsMap.get('final-proceedings-cover').length > 0 ? (
            <Table.Row>
              <Table.Cell>Final Proceedings Volume Cover</Table.Cell>
              <Table.Cell>{materialsMap.get('final-proceedings-cover')[0].title}</Table.Cell>
              <Table.Cell>
                <Button
                  icon
                  onClick={() => onDelete(materialsMap.get('final-proceedings-cover')[0].id)}
                >
                  <Icon name="delete" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : null}

          {/* Poster */}
          {materialsMap.get('at-a-glance-cover').length > 0 ? (
            <Table.Row>
              <Table.Cell>At-a-glance Volume Cover</Table.Cell>
              <Table.Cell>{materialsMap.get('at-a-glance-cover')[0].title}</Table.Cell>
              <Table.Cell>
                <Button icon onClick={() => onDelete(materialsMap.get('at-a-glance-cover')[0].id)}>
                  <Icon name="delete" />
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : null}

          {/* Volumes */}
          {materialsMap
            .get('volumes')
            .sort((a, b) => a.index - b.index)
            .map((volume, index, array) => (
              <Table.Row key={`volumes${index}`}>
                {index === 0 ? <Table.Cell rowSpan={array.length}>Volumes</Table.Cell> : null}
                <Table.Cell>{volume.title}</Table.Cell>
                <Table.Cell>
                  {index < array.length - 1 ? (
                    <Button icon onClick={() => onMoveDown('volumes', index)}>
                      <Icon name="arrow alternate circle down outline" />
                    </Button>
                  ) : null}
                  {index > 0 ? (
                    <Button icon onClick={() => onMoveUp('volumes', index)}>
                      <Icon name="arrow alternate circle up outline" />
                    </Button>
                  ) : null}
                  <Button icon onClick={() => onDelete(volume.id)}>
                    <Icon name="delete" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {/* Attachments */}
          {materialsMap
            .get('attachments')
            .sort((a, b) => a.index - b.index)
            .map((attachment, index, array) => (
              <Table.Row key={`attachments${index}`}>
                {index === 0 ? <Table.Cell rowSpan={array.length}>Attachments</Table.Cell> : null}
                <Table.Cell>{attachment.title}</Table.Cell>
                <Table.Cell>
                  {index < array.length - 1 ? (
                    <Button icon onClick={() => onMoveDown('attachments', index)}>
                      <Icon name="arrow alternate circle down outline" />
                    </Button>
                  ) : null}
                  {index > 0 ? (
                    <Button icon onClick={() => onMoveUp('attachments', index)}>
                      <Icon name="arrow alternate circle up outline" />
                    </Button>
                  ) : null}
                  <Button icon onClick={() => onDelete(attachment.id)}>
                    <Icon name="delete" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}

          {isEmpty ? (
            <Table.Row>
              <Table.Cell colSpan="3" textAlign="center">
                No materials found
              </Table.Cell>
            </Table.Row>
          ) : null}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="3">
              <Button icon labelPosition="left" primary size="small" onClick={() => setOpen(true)}>
                <Icon name="add" />
                Add
              </Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      <Modal open={open} onClose={() => setOpen(false)} size="large">
        <Modal.Header>Add material</Modal.Header>
        <Modal.Content scrolling>
          <AddMaterialForm
            materials={materials}
            formState={addFormState}
            setFormState={setAddFormState}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button icon size="small" onClick={() => setOpen(false)}>
            <Icon name="close" />
            Close
          </Button>
          <Button
            icon
            positive
            size="small"
            disabled={!addFormState.valid || !addFormState.dirty}
            onClick={onAddNew}
          >
            <Icon name="add" />
            Add
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export function AddMaterialForm({materials, formState, setFormState}) {
  const [sections] = useState(() => [
    {value: 'logo', text: 'Logo'},
    {value: 'poster', text: 'Poster'},
    {value: 'final-proceedings-cover', text: 'Final Proceedings Volume Cover'},
    {value: 'at-a-glance-cover', text: 'At-a-glance Volume Cover'},
    {value: 'volumes', text: 'Volumes'},
    {value: 'attachments', text: 'Attachments'},
  ]);

  const onChange = useCallback(
    (e, field) => {
      setFormState(prevState => {
        prevState.controls[field.name].value = field.value;
        prevState.controls[field.name].dirty = true;
        prevState.controls[field.name].valid = !!field.value; // every field is required

        const updatedControls = {
          ...prevState.controls,
          [field.name]: {
            ...prevState.controls[field.name],
            value: field.value,
            dirty: true,
            valid: !!field.value,
          },
        };

        const updatedState = {
          ...prevState,
          controls: updatedControls,
          valid: Object.values(prevState.controls).every(control => control.valid),
          dirty: Object.values(prevState.controls).some(control => control.dirty),
        };

        return updatedState;
      });
    },
    [formState]
  );

  return (
    <Form error={!formState.valid && !!formState.errorMessage}>
      <Form.Field>
        <label>File</label>
        <Select
          placeholder="Select a file"
          options={materials.map(material => ({
            key: `file${material.id}`,
            value: material.id,
            text: material.title,
          }))}
          value={formState.controls.fileID.value}
          error={!formState.controls.fileID.valid && formState.controls.fileID.dirty}
          name="fileID"
          onChange={onChange}
        />
      </Form.Field>
      <Form.Field>
        <label>Section</label>
        <Select
          placeholder="Select section"
          options={sections.map((section, index) => ({key: `section${index}`, ...section}))}
          value={formState.controls.section.value}
          error={!formState.controls.section.valid && formState.controls.section.dirty}
          name="section"
          onChange={onChange}
        />
      </Form.Field>
      <Message error header="Error" content={formState.errorMessage} />
    </Form>
  );
}
