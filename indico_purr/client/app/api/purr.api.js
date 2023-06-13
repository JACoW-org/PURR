import {concatMap, forkJoin, of} from 'rxjs';
import {fetchJson, putJson} from '../purr.lib';

export function connect(connection) {
  return putJson('connect', connection).pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error connecting');
      }
      return of({
        settings: event.result.settings,
        connectionOk: event.result.connection_ok,
        settingsValid: !!event.result.settings_valid,
      });
    })
  );
}

export function disconnect() {
  return putJson('disconnect', {}).pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error connecting'); // TODO event.message
      }
      return of(event.result);
    })
  );
}

export function fetchSettings() {
  return fetchJson('settings-data').pipe(
    concatMap(event => {
      if (event.error) {
        throw new Error('error fetching PURR settings');
      }

      return of({settings: event.result.settings, valid: event.result.is_valid});
    })
  );
}

export function fetchSettingsAndAttachements() {
  return forkJoin([
    fetchJson('settings-data'),
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

export function fetchInfo(apiUrl, eventId, apiKey) {
  const url = new URL(`/api/info/${eventId}/${apiKey}`, apiUrl);

  return fetchJson(url).pipe(
    concatMap(response => {
      if (response.error) {
        throw new Error('error fetching MEOW info');
      }

      return of({info: response.result.params});
    })
  );
}
