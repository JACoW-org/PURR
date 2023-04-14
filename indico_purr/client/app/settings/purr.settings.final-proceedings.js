import React, {useCallback, useState} from 'react';
import {Accordion, Form, Icon, Input, Tab, TextArea} from 'semantic-ui-react';

export function FinalProceedingsSettings({finalProcSettings, setFinalProcSettings}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onClick = useCallback(
    (e, titleProps) => {
      const {index} = titleProps;
      setActiveIndex(activeIndex === index ? -1 : index);
    },
    [activeIndex]
  );

  const onFieldChange = (e, field) => {
    setFinalProcSettings({...finalProcSettings, [field.name]: field.value});
  };

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
              <Form.Field>
                <label>ISBN</label>
                <Input
                  name="isbn"
                  value={finalProcSettings.isbn || ''}
                  placeholder="Insert ISBN"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field>
                <label>ISSN</label>
                <Input
                  name="issn"
                  value={finalProcSettings.issn || ''}
                  placeholder="Insert ISSN"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field>
                <label>Booktitle short</label>
                <Input
                  name="booktitle_short"
                  value={finalProcSettings.booktitle_short || ''}
                  placeholder="Insert booktitle short"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field>
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
              <Form.Field>
                <label>Series</label>
                <Input
                  name="series"
                  value={finalProcSettings.series || ''}
                  placeholder="Insert series"
                  onChange={onFieldChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Series number</label>
                <Input
                  name="series_number"
                  value={finalProcSettings.series_number || ''}
                  placeholder="Insert series number"
                  onChange={onFieldChange}
                />
              </Form.Field>
            </Form.Group>
            <Form.Field>
              <label>Location</label>
              <Input
                name="location"
                value={finalProcSettings.location || ''}
                placeholder="Insert location"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field inline>
              <label>Hosting info</label>
              <TextArea
                name="hostInfo"
                value={finalProcSettings.hostInfo || ''}
                placeholder="Add host info"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field inline>
              <label>Editorial Board</label>
              <TextArea
                name="editorialBoard"
                value={finalProcSettings.editorialBoard || ''}
                placeholder="Add editorial board"
                onChange={onFieldChange}
              />
            </Form.Field>
          </Accordion.Content>
          <Accordion.Title active={activeIndex === 1} index={1} onClick={onClick}>
            <Icon name="dropdown" />
            Materials
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            {/* <Card text={'prova'} /> */}
          </Accordion.Content>
          <Accordion.Title active={activeIndex === 2} index={2} onClick={onClick}>
            <Icon name="dropdown" />
            DOI
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Form.Field>
              <label>DOI Base URL</label>
              <Input
                name="doi_base_url"
                value={finalProcSettings.doi_base_url || ''}
                placeholder="Insert DOI Base URL"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field>
              <label>DOI User</label>
              <Input
                name="doi_user"
                value={finalProcSettings.doi_user || ''}
                placeholder="Insert DOI user"
                onChange={onFieldChange}
              />
            </Form.Field>
            <Form.Field>
              <label>DOI Password</label>
              <Input
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
