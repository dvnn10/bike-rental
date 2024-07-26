import { LockOutlined } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import { Link, Redirect, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {
  isAuthenticated,
  redirectHelper,
  setLocalData,
} from '../../shared/helper';
import api from '../../shared/api';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from '../includes/Navbar';

export const ForgotPassword = () => {
  const history = useHistory();
  const [showResend, setShowResend] = useState(false);
  const [formData, setFormData] = useState({
    email_username: '',
    code: '',
    password: '',
    password2: '',
  });

  const [optSent, setOtpSent] = useState(false);
  const [optVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);
  //Redirect if logged in
  redirectHelper(history);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (formData.email_username !== '' && !optSent) {
      sendDetailsToServer();
    } else if (
      formData.email_username !== '' &&
      formData.code !== '' &&
      optSent &&
      !optVerified
    ) {
      verifyOtp();
    } else if (
      formData.email_username !== '' &&
      formData.code !== '' &&
      formData.password !== '' &&
      formData.password2 !== '' &&
      optSent &&
      optVerified
    ) {
      changepassword();
    } else {
      toast.error('Something went wrong');
      //   alert(formData.password);
      // props.showError('Passwords do not match');
    }
  };

  const sendDetailsToServer = async () => {
    if (formData.email_username.length) {
      const payload = {
        email_username: formData.email_username,
      };
      let response = await api.auth.sendResetOtp(payload);
      if (response.success) {
        toast.success('OTP Sent Successfully');

        setOtpSent(true);
      } else {
        response.errors.forEach((element) => {
          toast.error(element.msg);
        });
      }
    } else {
      toast.error('Please enter valid data');
    }
  };
  const verifyOtp = async () => {
    if (formData.email_username.length && formData.code.length) {
      const payload = {
        email_username: formData.email_username,
        code: formData.code,
      };
      let response = await api.auth.validateOtp(payload);
      if (response.success) {
        toast.success('OTP Verified Successfully');

        setOtpVerified(true);
      } else {
        response.errors.forEach((element) => {
          toast.success(element.msg);
        });
      }
    } else {
      toast.error('Please enter valid OTP');
    }
  };
  const changepassword = async () => {
    if (
      formData.email_username.length &&
      formData.code.length &&
      formData.password.length &&
      formData.password2.length
    ) {
      const payload = {
        email_username: formData.email_username,
        code: formData.code,
        password: formData.password,
        password2: formData.password2,
      };
      let response = await api.auth.changePassword(payload);
      if (response.success) {
        toast.success('Password Changed Successfully');
        history.push('/login');
      } else {
        response.errorspush.forEach((element) => {
          toast.error(element.msg);
        });
      }
    } else {
      toast.error('Please enter valid Password');
    }
  };

  const resendVerification = async () => {
    let response = await api.resendVerificationEmail();
    if (response.success) {
      toast.success('Verification email sent');
    } else {
      toast.error('Something went wrong');
    }
  };

  return (
    <Fragment>
      <Navbar />
      <Container component='main' maxWidth='xs'>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {showResend && (
            <Alert severity='warning' onClick={resendVerification()}>
              Please verify your email to continue. Click here to resend
              Verification Email
            </Alert>
          )}

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Change Password
          </Typography>
          <form>
            <Box sx={{ pt: 2, pb: 2, minWidth: 350 }}>
              <TextField
                label='Email or Username'
                variant='outlined'
                sx={{ minWidth: 350 }}
                type='text'
                name='email_username'
                onChange={handleChange}
                disabled={optSent ? true : false}
                id='email_username'
                placeholder='Email Address or Username'
              />
            </Box>
            {optSent ? (
              <Box sx={{ pt: 2, pb: 2, minWidth: 350 }}>
                <TextField
                  label='OTP Code'
                  variant='outlined'
                  sx={{ minWidth: 350 }}
                  type='number'
                  name='code'
                  className='form-control'
                  onChange={handleChange}
                  disabled={optVerified ? true : false}
                  id='code'
                  placeholder='OTP Code'
                />
              </Box>
            ) : (
              <></>
            )}

            {optVerified ? (
              <>
                <Box sx={{ pt: 2, pb: 2, minWidth: 350 }}>
                  <TextField
                    label='Password'
                    variant='outlined'
                    sx={{ minWidth: 350 }}
                    type='password'
                    name='password'
                    onChange={handleChange}
                    id='password'
                    placeholder='Password'
                  />
                </Box>
                <Box sx={{ pt: 2, pb: 2, minWidth: 350 }}>
                  <TextField
                    label='Confirm Password'
                    variant='outlined'
                    type='password'
                    sx={{ minWidth: 350 }}
                    name='password2'
                    className='form-control'
                    onChange={handleChange}
                    id='password2'
                    placeholder='Confirm Password'
                  />
                </Box>
              </>
            ) : (
              <></>
            )}

            <Button
              type='submit'
              variant='contained'
              sx={{ pt: 1, pb: 1, mb: 2, minWidth: 150 }}
              onClick={handleSubmitClick}
              className='btn btn-log btn-block btn-thm2'
            >
              {optVerified
                ? 'Change Password'
                : optSent
                ? 'Validate OPT'
                : 'Send OTP'}
            </Button>
          </form>
          <Grid>
            <Grid item xs>
              <Link to='/login' variant='body2'>
                <Typography variant='button'>
                  Remember Password? Login!
                </Typography>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/register' variant='body2'>
                <Typography variant='button'>Sign Up</Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Fragment>
  );
};
