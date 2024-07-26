import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Navbar from '../includes/Navbar';
import { getBikeColors } from '../../shared/staticData';
import Map from './Map';
import { CoverImage } from '../includes/Styles';
import api from '../../shared/api';
import { useLoading } from '../../context/loaderContext';
import { toast } from 'react-toastify';
import urls from '../../shared/url';
import { useHistory } from 'react-router-dom';
import { getUserInfo } from '../../shared/helper';

export const ManageProfile = () => {
  const loading = useLoading();
  const history = useHistory();
  const user = getUserInfo();
  useEffect(() => {
    getUser();
  }, []);

  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    contactNumber: '',
    role: '',
    status: '',
    password: '',
  });

  const getUser = async () => {
    try {
      loading.setLoading(true);
      let response = await api.manager.getUsers(user._id);
      if (response.success) {
        setInitialValues({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          username: response.data.username,
          email: response.data.email,
          contactNumber: response.data.contactNumber,
          role: response.data.role,
          status: response.data.status,
        });

        loading.setLoading(false);
      } else {
        toast.error('Something Went Wrong');
        loading.setLoading(false);
      }
    } catch (err) {
      toast.error('Something Went Wrong');
      loading.setLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('firstName is Required'),
    lastName: Yup.string().required('lastName is Required'),
    username: Yup.string().required('username is Required'),
    email: Yup.string()
      .email('Please enter valid email')
      .required('email is Required'),
    role: Yup.string().required('role is Required'),
    status: Yup.string().required('status is Required'),
  });

  const handleSubmit = async (values, props) => {
    try {
      loading.setLoading(true);
      let response;

      response = await api.manager.editUser(user._id, values);
      if (response.success) {
        toast.success('Task Successful!');
        loading.setLoading(false);
        props.resetForm();
        history.push('/');
      } else {
        response.errors.forEach((element) => {
          console.log(element.msg);
          toast.error(element.msg);
          loading.setLoading(false);
        });
      }
    } catch (err) {
      toast.error('Something Went Wrong');
      loading.setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <Container style={{ marginTop: 20 }}>
        <Toolbar>
          <Typography
            sx={{ flex: '1 1 100%' }}
            color='inherit'
            variant='H1'
            component='h1'
          >
            Edit Profile
          </Typography>
        </Toolbar>
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
          sx={{ mt: 1 }}
        >
          {(props) => (
            <Form>
              <Paper style={{ padding: 16 }}>
                <Grid container alignItems='flex-start' spacing={2}>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name='firstName'
                      type='text'
                      label='First Name'
                      helpertext={<ErrorMessage name='firstName' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name='lastName'
                      type='text'
                      label='Last Name'
                      helpertext={<ErrorMessage name='lastName' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name='username'
                      type='text'
                      label='Username'
                      disabled
                      helpertext={<ErrorMessage name='username' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name='contactNumber'
                      type='text'
                      label='Contact Number'
                      helpertext={<ErrorMessage name='contactNumber' />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      required
                      name='email'
                      type='email'
                      label='Email'
                      disabled
                      helpertext={<ErrorMessage name='email' />}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Field
                      as={Select}
                      fullWidth
                      name='role'
                      label='Select Role'
                      helpertext={<ErrorMessage name='role' />}
                    >
                      <MenuItem value={'user'}>user</MenuItem>
                      <MenuItem value={'manager'}>manager</MenuItem>
                    </Field>
                  </Grid>

                  <Grid item xs={6}>
                    <Field
                      as={Select}
                      fullWidth
                      name='status'
                      label='Select Status'
                      helpertext={<ErrorMessage name='status' />}
                    >
                      <MenuItem value={'active'}>Active</MenuItem>
                      <MenuItem value={'inactive'}>Inactive</MenuItem>
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name='password'
                      fullWidth
                      type='text'
                      label='Password'
                      helpertext={<ErrorMessage name='password' />}
                    />
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: 16 }}>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      disabled={props.isSubmitting}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Form>
          )}
        </Formik>
      </Container>
    </div>
  );
};
