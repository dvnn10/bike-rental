import {
  Check,
  ColorizeSharp,
  EmojiTransportation,
  Map,
  ModelTraining,
  MonitorWeight,
  Field,
  Star,
} from '@mui/icons-material';

import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import {
  Backdrop,
  Button,
  Card,
  CardActionArea,
  CardActions,
  Select,
  CardContent,
  CardMedia,
  Container,
  Fade,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  TextField,
  Toolbar,
  Typography,
  MenuItem,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useLoading } from '../../context/loaderContext';
import api from '../../shared/api';
import urls from '../../shared/url';
import Navbar from '../includes/Navbar';
import { getWeeksAfter } from '../../shared/helper';
import { toast } from 'react-toastify';
import { getBikeColors } from '../../shared/staticData';

export const Bikes = () => {
  const [bikes, setBikes] = useState([]);
  const [bikeRatings, setBikeRatings] = useState({});

  const loading = useLoading();
  const [openBook, setOpenBook] = useState(false);
  const handleOpenBook = () => setOpenBook(true);
  const handleCloseBook = () => setOpenBook(false);
  const [filters, setFilters] = useState({
    model: '',
    color: '',
    address: '',
    rating: '',
  });

  const [openRate, setOpenRate] = useState(false);
  const handleOpenRate = () => setOpenRate(true);
  const handleCloseRate = () => setOpenRate(false);

  const [selectedBike, setSelectedBike] = useState('');
  const [value, setValue] = useState([null, null]);
  const [rating, setRating] = useState([null, null]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    border: '1px solid #000',
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    loading.setLoading(true);
    getBikes();
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const getBikes = async () => {
    let query = new URLSearchParams(filters).toString();
    let param = 'all?limit=10&' + query;
    let response = await api.user.getBikes(param);
    if (response.success) {
      setBikes(response.data.bikes);
      console.log(response.data.bikes)
      setBikeRatings(response.data.ratingResult);
      loading.setLoading(false);
    }
    loading.setLoading(false);
  };

  const createBooking = async () => {
    handleCloseBook();
    loading.setLoading(true);
    let param = {};
    param.bikeId = selectedBike;
    param.startDate = value[0];
    param.endDate = value[1];

    let response = await api.user.addReservation(param);
    if (response.success) {
      toast.success('Reservation made successfully');
      loading.setLoading(false);
    } else {
      toast.error('Something went wrong');
    }
    loading.setLoading(false);
  };

  const addrating = async () => {
    handleCloseRate();
    loading.setLoading(true);
    let param = {};
    param.bikeId = selectedBike;
    param.rating = rating;

    let response = await api.user.addRating(param);
    if (response.success) {
      toast.success('Rating submitted successfully');
      loading.setLoading(false);
    } else {
      toast.error('Something went wrong');
    }
    loading.setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <Container style={{ marginTop: 50, marginBottom: 50 }}>
        <Card as={Container} style={{ padding: 20 }}>
          <Typography component={'h5'} variant={'h5'}>
            Filters:
          </Typography>
          <Grid container spacing={1}>
            <Toolbar item xs={3}>
              <TextField
                variant='outlined'
                placeholder=' Model'
                label=' Model'
                type='text'
                size='small'
                onChange={(e) =>
                  setFilters({ ...filters, model: e.target.value })
                }
              ></TextField>
            </Toolbar>
            <Toolbar item xs={3}>
              <TextField
                variant='outlined'
                placeholder=' Address'
                label=' Address'
                type='text'
                size='small'
                onChange={(e) =>
                  setFilters({ ...filters, address: e.target.value })
                }
              ></TextField>
            </Toolbar>
            <Toolbar item xs={3}>
              Color:{' '}
              <Select
                name='color'
                placeholder='Select a Color'
                size='small'
                label='Select a Color'
                onChange={(e) =>
                  setFilters({ ...filters, color: e.target.value })
                }
                style={{ minWidth: 120 }}
              >
                {getBikeColors.map((color) => {
                  return (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  );
                })}
              </Select>
            </Toolbar>

            <Toolbar item xs={3}>
              Rating:{' '}
              <Select
                name='rating'
                placeholder='Select a rating'
                label='Select a rating'
                size='small'
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
                style={{ minWidth: 120 }}
              >
                {[1, 2, 3, 4, 5].map((rating) => {
                  return (
                    <MenuItem key={rating} value={rating}>
                      {rating}
                    </MenuItem>
                  );
                })}
              </Select>
            </Toolbar>
            <Toolbar item xs={3}>
              <Button
                variant='contained'
                onClick={() => {
                  getBikes();
                }}
              >
                Filter
              </Button>
            </Toolbar>
          </Grid>
        </Card>
        <Grid container spacing={2}>
          {bikes.map((bike) => {
            return (
              <Toolbar item xs={4} key={bike._id}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardActionArea>
                    <CardMedia
                      component='img'
                      height='140'
                      style={{ flex: 'contain' }}
                      image={bike.images && bike.images.length > 0 ? `${urls.base_upload}/${bike.images[0].path}` : 'No_Image_Available.jpg'}
                      alt={bike.model}
                      sx={{ height: 250 }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant='h5' component='div'>
                        {bike.model}
                      </Typography>
                      <List component='nav' aria-label='main mailbox folders'>
                        <ListItemButton>
                          <ListItemIcon>
                            <ColorizeSharp />
                          </ListItemIcon>
                          <ListItemText primary={bike.color} />
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemIcon>
                            <Map />
                          </ListItemIcon>
                          <ListItemText primary={bike.address} />
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemIcon>
                            <EmojiTransportation />
                          </ListItemIcon>
                          <ListItemText primary={bike.brand} />
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemIcon>
                            <MonitorWeight />
                          </ListItemIcon>
                          <ListItemText primary={bike.weight} />
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemIcon>
                            <Check />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              bike.isAvailable ? 'Available' : 'Not Available'
                            }
                          />
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemIcon>
                            <Star />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${bikeRatings[bike._id]
                                ? bikeRatings[bike._id]
                                : 'No'
                              } ⭐️`}
                          />
                        </ListItemButton>
                      </List>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button
                      size='small'
                      color='primary'
                      variant='contained'
                      onClick={() => {
                        setSelectedBike(bike._id);
                        handleOpenBook();
                      }}
                    >
                      Book Bike
                    </Button>
                    <Button
                      size='small'
                      color='primary'
                      onClick={() => {
                        setSelectedBike(bike._id);
                        handleOpenRate();
                      }}
                    >
                      Rate
                    </Button>
                  </CardActions>
                </Card>
              </Toolbar>
            );
          })}
        </Grid>
        <Modal
          aria-labelledby='transition-modal-title'
          aria-describedby='transition-modal-description'
          open={openBook}
          onClose={handleCloseBook}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openBook}>
            <Box sx={style}>
              <Typography
                id='transition-modal-title'
                variant='h6'
                component='h2'
              >
                Book the Bike
              </Typography>
              <LocalizationProvider
                dateAdapter={AdapterMoment}
                style={{ margin: 10 }}
              >
                <DateRangePicker
                  startText='Start Date'
                  endText='End Date'
                  value={value}
                  onChange={(newValue) => {
                    setValue(newValue);
                  }}
                  renderInput={(startProps, endProps) => (
                    <React.Fragment>
                      <TextField {...startProps} />
                      <Box sx={{ mx: 2 }}> to </Box>
                      <TextField {...endProps} />
                    </React.Fragment>
                  )}
                />
              </LocalizationProvider>
              <Box>
                <Button
                  size='small'
                  color='primary'
                  variant='contained'
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    createBooking();
                  }}
                >
                  Book Bike
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
        <Modal
          aria-labelledby='transition-modal-title'
          aria-describedby='transition-modal-description'
          open={openRate}
          onClose={handleCloseRate}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openRate}>
            <Box sx={style}>
              <Typography
                id='transition-modal-title'
                variant='h6'
                component='h2'
              >
                Rate the Bike
              </Typography>
              <Select
                fullWidth
                name='color'
                label='Select a Color'
                onChange={(e) => setRating(e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((rate) => {
                  return (
                    <MenuItem key={rate} value={rate}>
                      {rate}
                    </MenuItem>
                  );
                })}
              </Select>
              <Box>
                <Button
                  size='small'
                  color='primary'
                  variant='contained'
                  style={{ marginTop: 20 }}
                  onClick={() => {
                    addrating();
                  }}
                >
                  Rate Bike
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Container>
    </div>
  );
};
