import React, {useCallback, useState} from 'react';
import {Accordion, Form, Grid, Icon, Input, Tab, TextArea} from 'semantic-ui-react';
import {has, isEmpty, isNil, map} from 'lodash';
import {buildAttachmentView} from '../utils/purr.utils';

export function FinalProceedingsSettings({
  finalProcSettings,
  updateFinalProcSetting,
  attachments,
  errors,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onClick = useCallback(
    (e, titleProps) => {
      const {index} = titleProps;
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
              <Form.Field error={hasError('booktitle_short')} width="8">
                <label>Booktitle short</label>
                <Input
                  name="booktitle_short"
                  value={finalProcSettings.booktitle_short || ''}
                  placeholder="Insert booktitle short"
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
            <Form.Field error={hasError('booktitle_long')} width="16">
              <label>Booktitle long</label>
              <Input
                name="booktitle_long"
                value={finalProcSettings.booktitle_long || ''}
                placeholder="Insert booktitle long"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field error={hasError('location')} width="16">
              <label>Location</label>
              <Input
                name="location"
                value={finalProcSettings.location || ''}
                placeholder="Insert location"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Group>
              <Form.Field error={hasError('series')} width="12">
                <label>Series</label>
                <Input
                  fluid
                  name="series"
                  value={finalProcSettings.series || ''}
                  placeholder="Insert series"
                  label={{icon: 'asterisk'}}
                  labelPosition="right corner"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('series_number')} width="4">
                <label>Series number</label>
                <Input
                  fluid
                  name="series_number"
                  value={finalProcSettings.series_number || ''}
                  placeholder="Insert series number"
                  label={{icon: 'asterisk'}}
                  labelPosition="right corner"
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
            <Form.Field error={hasError('host_info')} width="16">
              <label>Host info</label>
              <TextArea
                name="host_info"
                value={finalProcSettings.host_info || ''}
                placeholder="Add host info (you can use markdown)"
                rows={3}
                onChange={onFieldChange}
              />
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
                  label={{icon: 'asterisk'}}
                  labelPosition="right corner"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('issn')} width="8">
                <label>ISSN</label>
                <Input
                  name="issn"
                  value={finalProcSettings.issn || ''}
                  placeholder="Insert ISSN"
                  label={{icon: 'asterisk'}}
                  labelPosition="right corner"
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
            <Form.Field error={hasError('doi_base_url')}>
              <label>DOI Base URL</label>
              <Input
                fluid
                name="doi_base_url"
                value={finalProcSettings.doi_base_url || ''}
                placeholder="Insert DOI Base URL"
                label={{icon: 'asterisk'}}
                labelPosition="right corner"
                onChange={onFieldChange}
              />
            </Form.Field>
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
                  <h3>Tag</h3>
                </Grid.Column>
              </Grid.Row>
              {isEmpty(attachments) ? (
                <p>No file has been attached to this event.</p>
              ) : (
                map(attachments, (attachment, index) => {
                  const attachmentView = buildAttachmentView(attachment);
                  return (
                    // TODO add fontsize
                    <Grid.Row columns={3} key={index}>
                      <Grid.Column>
                        <span>{attachmentView.title}</span>
                      </Grid.Column>
                      <Grid.Column>
                        <span>{attachmentView.filename}</span>
                      </Grid.Column>
                      <Grid.Column>
                        <span>{attachmentView.scope}</span>
                      </Grid.Column>
                    </Grid.Row>
                  );
                })
              )}
            </Grid>
          </Accordion.Content>
        </Accordion>
      </Form>
    </Tab.Pane>
  );
}
