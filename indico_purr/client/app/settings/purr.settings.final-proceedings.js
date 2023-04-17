import React, { useCallback, useState } from 'react';
import { Accordion, Form, Icon, Input, Tab, TextArea } from 'semantic-ui-react';

export function FinalProceedingsSettings({ finalProcSettings, updateFinalProcSetting }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onClick = useCallback(
    (e, titleProps) => {
      const { index } = titleProps;
      setActiveIndex(activeIndex === index ? -1 : index);
    },
    [activeIndex]
  );

  const onFieldChange = (e, field) => updateFinalProcSetting(field.name, field.value);

  return (
    <Tab.Pane>
      <Form size="small">
        <Accordion fluid styled>
          <Accordion.Title active={activeIndex === 0} index={0} onClick={onClick}>
            <Icon name="dropdown" />
            Main
          </Accordion.Title>

          <Accordion.Content active={activeIndex === 0}>
            <Form.Group widths='equal'>
              <Form.Field>
                <label>Booktitle short</label>
                <Input
                  fluid
                  name="booktitle_short"
                  value={finalProcSettings.booktitle_short || ''}
                  placeholder="Insert booktitle short"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths='equal'>
              <Form.Field>
                <label>Booktitle long</label>
                <Input
                  fluid
                  name="booktitle_long"
                  value={finalProcSettings.booktitle_long || ''}
                  placeholder="Insert booktitle long"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths='equal'>
              <Form.Field>
                <label>Location</label>
                <Input
                  fluid
                  name="location"
                  value={finalProcSettings.location || ''}
                  placeholder="Insert location"
                  label={{ icon: 'asterisk' }}
                  labelPosition='right corner'
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 1} index={1} onClick={onClick}>
            <Icon name="dropdown" />
            Home
          </Accordion.Title>

          <Accordion.Content active={activeIndex === 1}>

            <Form.Group widths='equal'>
              <Form.Field>
                <label>Hosting info</label>
                <TextArea
                  name="host_info"
                  value={finalProcSettings.host_info || ''}
                  placeholder="Add host info"
                  label={{ icon: 'asterisk' }}
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths='equal'>
              <Form.Field>
                <label>Editorial Board</label>
                <TextArea
                  name="editorial_board"
                  value={finalProcSettings.editorial_board || ''}
                  label={{ icon: 'asterisk' }}
                  placeholder="Add editorial board"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
          </Accordion.Content>


          <Accordion.Title active={activeIndex === 2} index={2} onClick={onClick}>
            <Icon name="dropdown" />
            Codes
          </Accordion.Title>

          <Accordion.Content active={activeIndex === 2}>
            <Form.Group widths='equal'>
              <Form.Field>
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
              <Form.Field>
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

            <Form.Group widths='equal'>
              <Form.Field>
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
              <Form.Field>
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


          <Accordion.Content active={activeIndex === 4}>
            <Form.Field>
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
            <Form.Field>
              <label>DOI User</label>
              <Input
                fluid
                name="doi_user"
                value={finalProcSettings.doi_user || ''}
                placeholder="Insert DOI user"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field>
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
