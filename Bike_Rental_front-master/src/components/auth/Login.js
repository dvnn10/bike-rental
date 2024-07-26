import {
  LockOutlined,
  SettingsBackupRestoreRounded,
} from '@mui/icons-material';
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
import { toast } from 'react-toastify';
import Navbar from '../includes/Navbar';

export const Login = () => {
  const history = useHistory();
  const [showResend, setShowResend] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);
  //Redirect if logged in
  redirectHelper(history);

  const initialValues = {
    email_username: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email_username: Yup.string('please enter valid email or username').required(
      'Required'
    ),
    password: Yup.string().required('Required'),
  });

  const handleSubmit = async (values, props) => {
    console.log(values);
    let response = await api.auth.login(values);
    if (response.success) {
      setToken(response.token);

      if (response.data.status === 'active') {
        setLocalData('userInfo', JSON.stringify(response.data));
        setLocalData('apiToken', response.token);
        toast.success('Login successful. Please verify your email and login.');
        history.push('/');
      } else {
        setShowResend(true);
        resendVerification(response.token);
        toast.warning(
          'Login successful but please verify your email and try again.'
        );
      }
      props.resetForm();
    } else {
      console.log(response);
      response.errors.forEach((element) => {
        console.log(element.msg);
        toast.error(element.msg);
      });
    }
    props.setSubmitting(false);
  };

  const resendVerification = async (tokenVal) => {
    let response = await api.auth.resendVerificationEmail(tokenVal);
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
            <Alert severity='warning' onClick={() => resendVerification(token)}>
              Please verify your email to continue. Click here to resend
              Verification Email
            </Alert>
          )}

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign in
          </Typography>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            sx={{ mt: 1 }}
          >
            {(props) => (
              <Form>
                {/* <Box sx={{ mt: 1 }}> */}
                <Field
                  as={TextField}
                  margin='normal'
                  label='Email Address or Username'
                  variant='filled'
                  required
                  fullWidth
                  name='email_username'
                  autoComplete='email_username'
                  autoFocus
                  helperText={<ErrorMessage name='email_username' />}
                />
                <br />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Password'
                  variant='filled'
                  type='password'
                  required
                  fullWidth
                  name='password'
                  autoComplete='current-password'
                  helperText={<ErrorMessage name='password' />}
                />
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  disabled={props.isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {props.isSubmitting ? 'Loading' : 'Sign in'}
                </Button>
                {/* </Box> */}
              </Form>
            )}
          </Formik>
          <Grid>
            <Grid item xs>
              <Link to='/forgotPass' variant='body2'>
                <Typography variant='button'>Forgot password?</Typography>
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
