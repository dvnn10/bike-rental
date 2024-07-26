import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOM from 'react-dom';
import api from '../../shared/api';
import urls from '../../shared/url';
import Navbar from '../includes/Navbar';

import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterMoment from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import {
  Backdrop,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
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
} from '@mui/material';
import {
  Check,
  ColorizeSharp,
  EmojiTransportation,
  MapOutlined,
  MonitorWeight,
  Star,
} from '@mui/icons-material';
import BikeSingle from './BikeSingle';
import { Box } from '@mui/system';
import { useLoading } from '../../context/loaderContext';
import { toast } from 'react-toastify';

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.accessToken = urls.mapbox_api;

const Map = () => {
  const mapContainerRef = useRef(null);
  const [markerLngLat, setMarkerLngLat] = useState([77.3144, 28.5947]);
  const [bikes, setBikes] = useState([]);
  const [isBikeSelected, setIsBikeSelected] = useState(false);
  const [selectedBike, setSelectedBike] = useState({});
  const [mapObject, setMap] = useState();
  const [value, setValue] = useState([null, null]);

  const [openBook, setOpenBook] = useState(false);
  const handleOpenBook = () => setOpenBook(true);
  const handleCloseBook = () => setOpenBook(false);

  const getBikes = async () => {
    let param = 'all';
    let response = await api.user.getBikes(param);
    setBikes(response.data.listings);
  };
  const loading = useLoading();

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

  const createBooking = async () => {
    handleCloseBook();
    loading.setLoading(true);
    let param = {};
    param.bikeId = selectedBike._id;
    param.startDate = value[0];
    param.endDate = value[1];

    let response = await api.user.addReservation(param);
    if (response.success) {
      setSelectedBike({});
      toast.success('Reservation made successfully');
      loading.setLoading(false);
    } else {
      toast.error('Something went wrong');
    }
    loading.setLoading(false);
  };

  function setMapCenter(coords) {
    if (mapObject) {
      mapObject.flyTo({
        center: coords,
        zoom: 15,
        bearing: 0,
        speed: 1, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        easing: function (t) {
          return t;
        },

        // this animation is considered essential with respect to prefers-reduced-motion
        essential: true,
      });
    }
  }
  // Initialize map when component mounts
  useEffect(() => {
    getBikes();
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/lmaps/ckl6t1boq578819qod5v7ynby',
      center: markerLngLat,
      zoom: 13,
    });
    setMap(map);

    var Bikes = ['==', ['get', 'category'], ''];

    map.on('load', () => {
      // add a clustered GeoJSON source for powerplant
      map.addSource('property', {
        type: 'geojson',
        data: urls.base_api + 'bike/geojson',
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50,
        clusterProperties: {
          Bikes: ['+', ['case', Bikes, 1, 0]],
        },
      });
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'property',
        filter: ['has', 'point_count'],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FF5A5F',
            100,
            '#f1f075',
            750,
            '#f28cb1',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'property',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
      });
      map.loadImage('/marker.png', function (error, image) {
        if (error) throw error;
        map.addImage('Bikes', image);
        map.addImage('Default', image);
      });
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'property',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['case', Bikes, 'Bikes', 'Default'],
          'icon-size': 0.1,
        },
      });
      // inspect a cluster on click
      map.on('click', 'clusters', function (e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        var clusterId = features[0].properties.cluster_id;
        map
          .getSource('Bikes')
          .getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });
      var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
      map.on('mouseenter', 'unclustered-point', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var bike = e.features[0].properties;

        map.getCanvas().style.cursor = 'pointer';
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        const tooltipNode = document.createElement('div');
        ReactDOM.render(<BikeSingle bike={bike}></BikeSingle>, tooltipNode);
        popup
          .setLngLat(coordinates)
          .setDOMContent(tooltipNode)
          .addTo(map)
          .setMaxWidth('25%');
      });

      map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });
      map.on('click', (e) => {
        setIsBikeSelected(false);
        setSelectedBike({});
      });
      map.on('click', 'unclustered-point', function (e) {
        setSelectedBike(e.features[0].properties);
        setIsBikeSelected(true);
        map.easeTo({
          center: e.features[0].geometry.coordinates,
        });
      });
      map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
      });
    });

    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });
    map.addControl(geocoder);
    geocoder.on('result', function (e) {
      console.log(e.result.center);
    });

    var geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      marker: false,
      trackUserLocation: true,
    });
    map.addControl(geolocate);
    geolocate.on('geolocate', function (e) {
      console.log(e.coords.latitude);
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <>
      <Navbar></Navbar>
      <div className='maps-listing desktop-top-margin'>
        <div className='listing-map-container' ref={mapContainerRef}></div>
        {selectedBike._id && (
          <Toolbar className='map-listing-overlay'>
            <Grid item xs={4} key={selectedBike._id}>
              <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component='img'
                    height='140'
                    style={{ flex: 'contain' }}
                    image={`${urls.base_upload}/${
                      JSON.parse(selectedBike.images)[0].path
                    }`}
                    alt={selectedBike.model}
                    sx={{ height: 250 }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant='h5' component='div'>
                      {selectedBike.model}
                    </Typography>
                    <List component='nav' aria-label='main mailbox folders'>
                      <ListItemButton>
                        <ListItemIcon>
                          <ColorizeSharp />
                        </ListItemIcon>
                        <ListItemText primary={selectedBike.color} />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon>
                          <MapOutlined />
                        </ListItemIcon>
                        <ListItemText primary={selectedBike.address} />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon>
                          <EmojiTransportation />
                        </ListItemIcon>
                        <ListItemText primary={selectedBike.brand} />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon>
                          <MonitorWeight />
                        </ListItemIcon>
                        <ListItemText primary={selectedBike.weight} />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            selectedBike.isAvailable
                              ? 'Available'
                              : 'Not Available'
                          }
                        />
                      </ListItemButton>
                      <ListItemButton>
                        <ListItemIcon>
                          <Star />
                        </ListItemIcon>
                        <ListItemText primary={`${4.5} ⭐️`} />
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
                      handleOpenBook();
                    }}
                  >
                    Book Bike
                  </Button>
                  <Button
                    size='small'
                    color='primary'
                    onClick={() => {
                      setSelectedBike({});
                    }}
                  >
                    Cancel
                  </Button>
                </CardActions>
              </Card>
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
          </Toolbar>
        )}
      </div>
    </>
  );
};

export default Map;
