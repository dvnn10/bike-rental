import React from 'react';
import './App.css';
import AppRouter from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Backdrop, CircularProgress } from '@mui/material';
import { LoadingProvider } from './context/loaderContext';

function App() {
  return (
    <LoadingProvider>
      <div className='App'>
        <AppRouter />
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </LoadingProvider>
  );
}

export default App;
