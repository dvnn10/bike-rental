import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
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

export const AddEditBikes = ({ match, location }) => {
  const [markerLngLat, setMarkerLngLat] = useState([77.3144, 28.5947]);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const loading = useLoading();
  const history = useHistory();
  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = [];
    images.forEach((image) => newImageUrls.push(URL.createObjectURL(image)));
    setImageUrls(newImageUrls);
  }, [images]);

  useEffect(() => {
    if (match.params.type !== 'add') {
      getBike();
    }
  }, [match.params.type]);

  const [initialValues, setInitialValues] = useState({
    model: '',
    color: 'black',
    address: '',
    brand: '',
    weight: '',
    isAvailable: true,
  });

  const getBike = async () => {
    try {
      loading.setLoading(true);
      let response = await api.manager.getBikes(match.params.type);
      if (response.success) {
        setInitialValues({
          model: response.data.model,
          color: response.data.color,
          address: response.data.address,
          brand: response.data.brand,
          weight: response.data.weight,
          isAvailable: response.data.isAvailable,
        });
        setMarkerLngLat([
          response.data.location.coordinates[0],
          response.data.location.coordinates[1],
        ]);
        let imageUrl = [];
        response.data.images.map((image) => {
          imageUrl.push(`${urls.base_upload}${image.path}`);
        });
        setImageUrls(imageUrl);
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
    model: Yup.string().required('model is Required'),
    color: Yup.string().required('color is Required'),
    address: Yup.string().required('address is Required'),
    brand: Yup.string().required('brand is required'),
    weight: Yup.number().required('weight is required'),
    isAvailable: Yup.bool().required('isAvailable is required'),
  });

  const handleSubmit = async (values, props) => {
    try {
      loading.setLoading(true);
      values['latitude'] = markerLngLat[0];
      values['longitude'] = markerLngLat[1];

      let response = await api.manager.addEditBike(
        match.params.type,
        values,
        images
      );
      toast.success('Task Successful!');
      loading.setLoading(false);
      props.resetForm();

      setImageUrls([]);
      setImages([]);
      history.push('/manager/bikes');
    } catch (err) {
      loading.setLoading(false);
    }
  };

  const onImageChange = (e) => {
    setImages([...e.target.files]);
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
            {match.params.type === 'add' ? 'Add' : 'Edit'} Bike
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
                      name='model'
                      type='text'
                      label='Model'
                      helpertext={<ErrorMessage name='model' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={Select}
                      fullWidth
                      name='color'
                      label='Select a Color'
                      helpertext={<ErrorMessage name='color' />}
                    >
                      {getBikeColors.map((color) => {
                        return (
                          <MenuItem key={color} value={color}>
                            {color}
                          </MenuItem>
                        );
                      })}
                    </Field>
                  </Grid>

                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      name='brand'
                      fullWidth
                      required
                      type='text'
                      label='Brand'
                      helpertext={<ErrorMessage name='brand' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      name='weight'
                      fullWidth
                      required
                      type='text'
                      label='Weight'
                      helpertext={<ErrorMessage name='weight' />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name='address'
                      fullWidth
                      required
                      type='text'
                      label='Address'
                      helpertext={<ErrorMessage name='address' />}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Paper>
                      <Field
                        as={TextField}
                        name='lat'
                        fullWidth
                        required
                        type='text'
                        label='Latitude'
                        disabled
                        value={markerLngLat[1]}
                        helpertext={<ErrorMessage name='lat' />}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      name='long'
                      fullWidth
                      required
                      type='text'
                      label='Longitude'
                      value={markerLngLat[0]}
                      disabled
                      helpertext={<ErrorMessage name='long' />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Map
                      markerLngLat={markerLngLat}
                      setMarkerLngLat={setMarkerLngLat}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <input
                      type='file'
                      multiple
                      accept='image/*'
                      onChange={onImageChange}
                      className={'custom-file-input'}
                    />
                  </Grid>
                  <Grid
                    spacing={0}
                    container
                    alignItems='flex-center'
                    justify='flex-center'
                    direction='row'
                  >
                    {imageUrls.map((imageSrc) => (
                      <CoverImage item>
                        <img src={imageSrc} alt={imageSrc} />
                      </CoverImage>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      label='Is Available?'
                      control={
                        <Field
                          as={Checkbox}
                          name='isAvailable'
                          type='checkbox'
                        />
                      }
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
                      {props.isSubmitting
                        ? 'Loading'
                        : match.params.type === 'add'
                        ? 'Add Bike'
                        : 'Edit Bike'}
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
