import { first, flow, forOwn, groupBy, map, nth, sortBy, split } from 'lodash';

export function buildAttachments(attachments) {
  return flow(
    attachments =>
      map(attachments, attachment => ({
        ...attachment,
        ...getAttachmentIndexAndSection(attachment),
      })), // add index and section to each attachment
    attachments => groupBy(attachments, attachment => attachment.section), // group by sections
    sections => forOwn(sections, attachments => sortBy(attachments, attachment => attachment.index)) // sort attachments in each section by index
  )(attachments);
}

function getAttachmentIndexAndSection(attachment) {
  return flow(
    filename => split(filename, '.'), // split by '.' to remove extension
    tokens => first(tokens), // keep first element
    root => split(root, '-'), // split by '-'
    tokens => ({ section: nth(tokens, 2), index: +nth(tokens, 1) }) // get section and index element
  )(attachment.filename);
}


export async function notificationRequestPermission() {
  const purrSpa = document.getElementById('purr-spa');
  if (purrSpa) {

    // check notification permission
    let granted = false;

    if (Notification.permission === 'granted') {
      granted = true;
    } else if (Notification.permission !== 'denied') {
      let permission = await Notification.requestPermission();
      granted = permission === 'granted' ? true : false;
    }

    purrSpa.dataset.notifications = `${granted}`;

  }
}

export function notificationShowMessage() {
  const purrSpa = document.getElementById('purr-spa');
  if (purrSpa && purrSpa.dataset.notifications === `${true}`) {

    // create a new notification
    const notification = new Notification('PURR Notification', {
      body: 'PURR task completed'
    });

    // close after 5 seconds
    // setTimeout(() => {
    //   notification.close();
    // }, 5 * 1000);

    // close on click
    notification.addEventListener('click', () => {
      notification.close();
    });

  }
}