import React from 'react';
import {isEmpty, map} from 'lodash';

const Logger = ({logs}) => {
  const header = severity => {
    switch (severity) {
      case 'info':
        return '[INFO]';
      case 'warning':
        return '[WARNING]';
      case 'error':
        return '[ERROR]';
      default:
        return '';
    }
  };

  return (
    <>
      {isEmpty(logs) ? (
        '-'
      ) : (
        <ul className="logs-list">
          {map(logs, (log, index) => (
            <li className={`log ${log.severity}`} key={index}>
              {`[${log.timestamp}]`} {header(log.severity)} {log.message}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Logger;
