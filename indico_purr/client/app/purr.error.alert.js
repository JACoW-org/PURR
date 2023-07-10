import React from 'react';
import {Button, Modal} from 'semantic-ui-react';

export const PurrErrorAlert = ({message, open, setOpen}) => {
  return (
    <Modal size='mini' scrolling className='error-alert' open={open} onClose={() => setOpen(false)}>
      <Modal.Header>Error message</Modal.Header>
      <Modal.Content>
        <Modal.Description>{message}</Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={() => setOpen(false)}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
};
