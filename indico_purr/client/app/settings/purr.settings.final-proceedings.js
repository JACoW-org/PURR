import React, { useCallback, useState } from 'react';
import { Accordion, Divider, Form, Grid, Icon, Input, Tab, TextArea } from 'semantic-ui-react';
import { capitalize, has, isEmpty, isNil, map } from 'lodash';

export function FinalProceedingsSettings({
  finalProcSettings,
  updateFinalProcSetting,
  attachments,
  errors,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onClick = useCallback(
    (e, titleProps) => {
      const { index } = titleProps;
      setActiveIndex(activeIndex === index ? -1 : index);
    },
    [activeIndex]
  );

  const onFieldChange = (e, field) => updateFinalProcSetting(field.name, field.value);

  const hasError = useCallback(fieldName => has(errors, fieldName), [errors]);

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
              <Form.Field error={hasError('doi_protocol')}>
                <label>DOI URL Protocol</label>
                <Input
                  fluid
                  name="doi_protocol"
                  value={finalProcSettings.doi_protocol || ''}
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
            <Grid divided="vertically">
              {/* HEADER */}
              <Grid.Row columns={3}>
                <Grid.Column>
                  <h3>Title</h3>
                </Grid.Column>
                <Grid.Column>
                  <h3>Filename</h3>
                </Grid.Column>
                <Grid.Column>
                  <h3>Section</h3>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            {isEmpty(attachments) ? (
              <p>No file has been attached to this event.</p>
            ) : (
              <>
                <Section key="logo" sectionKey="logo" section={attachments.logo} />
                <Divider />
                <Section key="poster" sectionKey="poster" section={attachments.poster} />
                <Divider />
                <Section key="volumes" sectionKey="volumes" section={attachments.volumes} />
                <Divider />
                <Section
                  key="attachments"
                  sectionKey="attachments"
                  section={attachments.attachments}
                />
              </>
            )}
          </Accordion.Content>
        </Accordion>
      </Form>
    </Tab.Pane>
  );
}

function Section({ sectionKey, section }) {
  // console.log({sectionKey, section})

  return isNil(section) ? (
    <p>No material found for {sectionKey}.</p>
  ) : (
    <Grid>
      {map(section, attachment => {
        return (
          <Grid.Row columns={3} key={attachment.filename}>
            <Grid.Column>
              <span>{attachment.title}</span>
            </Grid.Column>
            <Grid.Column>
              <span>{attachment.filename}</span>
            </Grid.Column>
            <Grid.Column>
              <span>{capitalize(attachment.section)}</span>
            </Grid.Column>
          </Grid.Row>
        );
      })}
    </Grid>
  );
}
