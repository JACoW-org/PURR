import React, {useCallback, useState} from 'react';
import {Accordion, Form, Icon, Input, Tab, TextArea} from 'semantic-ui-react';
import { has } from 'lodash';

export function FinalProceedingsSettings({finalProcSettings, updateFinalProcSetting, errors}) {
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
            Main
          </Accordion.Title>

          <Accordion.Content active={activeIndex === 0}>
            <Form.Group>
              <Form.Field error={hasError('isbn')}>
                <label>ISBN</label>
                <Input
                  fluid
                  name="isbn"
                  value={finalProcSettings.isbn || ''}
                  placeholder="Insert ISBN"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('issn')}>
                <label>ISSN</label>
                <Input
                  fluid
                  name="issn"
                  value={finalProcSettings.issn || ''}
                  placeholder="Insert ISSN"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field error={hasError('booktitle_short')}>
                <label>Booktitle short</label>
                <Input
                  name="booktitle_short"
                  value={finalProcSettings.booktitle_short || ''}
                  placeholder="Insert booktitle short"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('booktitle_long')}>
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
              <Form.Field error={hasError('series')}>
                <label>Series</label>
                <Input
                  fluid
                  name="series"
                  value={finalProcSettings.series || ''}
                  placeholder="Insert series"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field error={hasError('series_number')}>
                <label>Series number</label>
                <Input
                  fluid
                  name="series_number"
                  value={finalProcSettings.series_number || ''}
                  placeholder="Insert series number"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Field error={hasError('location')}>
              <label>Location</label>
              <Input
                name="location"
                value={finalProcSettings.location || ''}
                placeholder="Insert location"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field error={hasError('host_info')}>
              <label>Hosting info</label>
              <TextArea
                name="host_info"
                value={finalProcSettings.host_info || ''}
                placeholder="Add host info"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field error={hasError('editorial_board')}>
              <label>Editorial Board</label>
              <TextArea
                name="editorial_board"
                value={finalProcSettings.editorial_board || ''}
                placeholder="Add editorial board"
                onChange={onFieldChange}
              />
            </Form.Field>
          </Accordion.Content>


          <Accordion.Title active={activeIndex === 3} index={3} onClick={onClick}>
            <Icon name="dropdown" />
            Materials
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 3}>
            {/* <Card text={'prova'} /> */}
          </Accordion.Content>


          <Accordion.Title active={activeIndex === 4} index={4} onClick={onClick}>
            <Icon name="dropdown" />
            DOI
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Form.Field error={hasError('doi_base_url')}>
              <label>DOI Base URL</label>
              <Input
                fluid
                name="doi_base_url"
                value={finalProcSettings.doi_base_url || ''}
                placeholder="Insert DOI Base URL"
                label={{ icon: 'asterisk' }}
                labelPosition='right corner'
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
        </Accordion>
      </Form>
    </Tab.Pane>
  );
}
