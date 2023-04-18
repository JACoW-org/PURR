import {concatMap, forkJoin, of} from 'rxjs';
import {fetchJson, putJson} from '../purr.lib';

export function connect() {
  return fetchJson('connect').pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error connecting');
      }
      return of(event.result);
    })
  );
}

export function disconnect() {
  return putJson('disconnect', {}).pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error connecting');
      }
      return of(event.result);
    })
  );
}

export function fetchSettings() {
  return fetchJson('settings-and-event-data').pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error fetching PURR settings');
      }

      return of(event.result.settings);
    })
  );
}

export function fetchSettingsAndAttachements() {
  return forkJoin([
    fetchJson('settings-and-event-data'),
    fetchJson('final-proceedings-attachments-data'),
  ]).pipe(
    concatMap(([settingsEvent, attachmentsEvent]) => {
      if (settingsEvent.error) {
        throw new Error('error fetching event settings');
      }

      if (attachmentsEvent.error) {
        throw new Error('error fetching event attachments');
      }

      return of({
        settings: settingsEvent.result.settings,
        attachments: attachmentsEvent.result.attachments,
      });
    })
  );
}

export function saveSettings(requestBody) {
  return putJson('settings-data', requestBody).pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error saving PURR settings');
      }

      return of(event.result);
    })
  );
}
