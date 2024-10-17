import React, { createContext, useContext, useState } from 'react';
import { PurrErrorAlert } from '../purr.error.alert';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {

  const [error, setError] = useState(null);

  const handleError = (message) => {
    setError(message);
  }

  const clearError = () => {
    setError(null);
  }

  return (
    <>
      <ErrorContext.Provider value={{ error, handleError, clearError }}>
        {children}
      </ErrorContext.Provider>
      <PurrErrorAlert
        message={error?.message}
        open={!!error}
        setOpen={setError}
      ></PurrErrorAlert>
    </>
  )
}

export const useError = () => useContext(ErrorContext);