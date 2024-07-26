/*import { LockOutlined } from '@mui/icons-material';
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
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { redirectHelper, setLocalData } from '../../shared/helper';
import { toast } from 'react-toastify';

import * as Yup from 'yup';
import api from '../../shared/api';
import Navbar from '../includes/Navbar';

export const Register = () => {
  const history = useHistory();
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);
  redirectHelper(history);

  const initialValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is Required'),
    lastName: Yup.string().required('Last Name is Required'),
    username: Yup.string().required('Username is Required'),
    email: Yup.string().email('please enter valid email').required('Required'),
    password: Yup.string().required('Required'),
    password2: Yup.string().required('Required'),
  });

  const handleSubmit = async (values, props) => {
    console.log(values);
    let response = await api.auth.register(values);
    if (response.success) {
      // setLocalData('userInfo', JSON.stringify(response.data));
      // setLocalData('apiToken', response.data.token);
      setShowResend(true);
      toast.success(
        'Registration successful. Please verify you email and login'
      );
      props.resetForm();
      history.push('/login');
    } else {
      console.log(response);
      response.errors.forEach((element) => {
        console.log(element.msg);
        toast.error(element.msg);
      });
    }
    props.setSubmitting(false);
  };

  const resendVerification = async () => {
    let response = await api.resendVerificationEmail();
    if (response.success) {
      toast.success('Verification email resent');
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
            <Alert as={Link} severity='success' onClick={resendVerification()}>
              Please verify your email to continue. Click here to resend
              Verification Email
            </Alert>
          )}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign Up
          </Typography>

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            sx={{ mt: 1 }}
          >
            {(props) => (
              <Form>
                <Field
                  as={TextField}
                  margin='normal'
                  label='First Name'
                  variant='filled'
                  required
                  fullWidth
                  name='firstName'
                  autoFocus
                  helperText={<ErrorMessage name='firstName' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Last Name'
                  variant='filled'
                  required
                  fullWidth
                  name='lastName'
                  autoFocus
                  helperText={<ErrorMessage name='lastName' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Username'
                  variant='filled'
                  required
                  fullWidth
                  name='username'
                  autoFocus
                  helperText={<ErrorMessage name='username' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Email Address'
                  variant='filled'
                  required
                  fullWidth
                  name='email'
                  autoComplete='email'
                  autoFocus
                  helperText={<ErrorMessage name='email' />}
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
                  autoComplete='password'
                  helperText={<ErrorMessage name='password' />}
                />
                <br />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Confirm Password'
                  variant='filled'
                  type='password'
                  required
                  fullWidth
                  name='password2'
                  autoComplete='password2'
                  helperText={<ErrorMessage name='password2' />}
                />
                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
              </Form>
            )}
          </Formik>

          <Grid>
            <Grid item>
              <Link to='/login' variant='body2'>
                <Typography variant='button'>Sign In</Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Fragment>
  );
};
*/
import { LockOutlined } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { Fragment, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { redirectHelper, setLocalData } from '../../shared/helper';
import { toast } from 'react-toastify';

import * as Yup from 'yup';
import api from '../../shared/api';
import Navbar from '../includes/Navbar';

export const Register = () => {
  const history = useHistory();
  const [showResend, setShowResend] = useState(false);
  const [selectedIdType, setSelectedIdType] = useState('');

  redirectHelper(history);

  const initialValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    password2: '',
    idType: '',
    idNumber: '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is Required'),
    lastName: Yup.string().required('Last Name is Required'),
    username: Yup.string().required('Username is Required'),
    email: Yup.string().email('Please enter a valid email').required('Email is Required'),
    password: Yup.string().required('Password is Required'),
    password2: Yup.string().required('Confirm Password is Required'),
    idType: Yup.string().required('ID Type is Required'),
    idNumber: Yup.string().when('idType', {
      is: (val) => val !== undefined && val !== '',
      then: Yup.string().required('ID Number is Required').matches(/^\d+$/, 'Should be a number'),
    }),
  });

  const handleSubmit = async (values, props) => {
    console.log(values);
    let response = await api.auth.register(values);
    if (response.success) {
      setShowResend(true);
      toast.success('Registration successful. Please verify your email and login');
      props.resetForm();
      history.push('/login');
    } else {
      console.log(response);
      response.errors.forEach((element) => {
        console.log(element.msg);
        toast.error(element.msg);
      });
    }
    props.setSubmitting(false);
  };

  const resendVerification = async () => {
    let response = await api.resendVerificationEmail();
    if (response.success) {
      toast.success('Verification email resent');
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
            <Alert as={Link} severity='success' onClick={resendVerification}>
              Please verify your email to continue. Click here to resend Verification Email
            </Alert>
          )}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlined />
          </Avatar>
          <Typography component='h1' variant='h5'>
            Sign Up
          </Typography>

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            sx={{ mt: 1 }}
          >
            {(props) => (
              <Form>
                <Field
                  as={TextField}
                  margin='normal'
                  label='First Name'
                  variant='filled'
                  required
                  fullWidth
                  name='firstName'
                  autoFocus
                  helperText={<ErrorMessage name='firstName' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Last Name'
                  variant='filled'
                  required
                  fullWidth
                  name='lastName'
                  autoFocus
                  helperText={<ErrorMessage name='lastName' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Username'
                  variant='filled'
                  required
                  fullWidth
                  name='username'
                  autoFocus
                  helperText={<ErrorMessage name='username' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Email Address'
                  variant='filled'
                  required
                  fullWidth
                  name='email'
                  autoComplete='email'
                  autoFocus
                  helperText={<ErrorMessage name='email' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Password'
                  variant='filled'
                  type='password'
                  required
                  fullWidth
                  name='password'
                  autoComplete='password'
                  helperText={<ErrorMessage name='password' />}
                />
                <Field
                  as={TextField}
                  margin='normal'
                  label='Confirm Password'
                  variant='filled'
                  type='password'
                  required
                  fullWidth
                  name='password2'
                  autoComplete='password2'
                  helperText={<ErrorMessage name='password2' />}
                />
                <Field
                  as={Select}
                  margin='normal'
                  label='ID Type'
                  variant='filled'
                  required
                  fullWidth
                  name='idType'
                  value={selectedIdType}
                  onChange={(e) => {
                    setSelectedIdType(e.target.value);
                    props.handleChange(e);
                  }}
                  sx={{ mt: 1 }}
                >
                  <MenuItem value=''>Select ID Type</MenuItem>
                  <MenuItem value='aadhar'>Aadhar Card</MenuItem>
                  <MenuItem value='pan'>PAN Card</MenuItem>
                  <MenuItem value='driving_license'>Driving Licence</MenuItem>
                </Field>

                {selectedIdType && (
                  <Field
                    as={TextField}
                    margin='normal'
                    label={`Enter ${selectedIdType === 'aadhar' ? 'Aadhar' : selectedIdType === 'pan' ? 'PAN' : 'Licence'} Number`}
                    variant='filled'
                    required
                    fullWidth
                    name='idNumber'
                    autoComplete='idNumber'
                    autoFocus
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          {selectedIdType === 'aadhar' ? 'Digits (12)' : selectedIdType === 'pan' ? 'Alphanumeric (10)' : 'Alphanumeric (15)'}
                        </InputAdornment>
                      ),
                    }}
                    helperText={<ErrorMessage name='idNumber' />}
                  />
                )}

                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
              </Form>
            )}
          </Formik>

          <Grid>
            <Grid item>
              <Link to='/login' variant='body2'>
                <Typography variant='button'>Sign In</Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Fragment>
  );
}; 