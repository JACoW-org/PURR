import React from 'react';
import {map} from 'lodash';

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
    <ul style={{overflowY: 'auto', maxHeight:'300px'}}>
      {map(logs, (log, index) => (
        <li className={`log ${log.severity}`} key={index}>
          {`[${log.timestamp}]`} {header(log.severity)} {log.message}
        </li>
      ))}
    </ul>
  );
};

export default Logger;
