import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import url from '../../shared/url';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Toolbar } from '@mui/material';

mapboxgl.accessToken = url.mapbox_api;

const Map = ({ setMarkerLngLat, markerLngLat }) => {
  const mapContainerRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/lmaps/ckl6t1boq578819qod5v7ynby',
      center: markerLngLat,
      zoom: 14,
    });

    var marker = new mapboxgl.Marker({
      color: '#FF5A5F',
      draggable: true,
    })
      .setLngLat(markerLngLat)
      .addTo(map);

    marker.on('dragend', () => {
      var lngLat = marker.getLngLat();
      setMarkerLngLat([lngLat.lng, lngLat.lat]);
    });
    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });
    map.addControl(geocoder);
    geocoder.on('result', function (e) {
      console.log(e.result.center);
      marker.setLngLat(e.result.center);
      var lngLat = marker.getLngLat();
      setMarkerLngLat([lngLat.lng, lngLat.lat]);
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
      marker.setLngLat([e.coords.longitude, e.coords.latitude]);
      var lngLat = marker.getLngLat();
      setMarkerLngLat([lngLat.lng, lngLat.lat]);
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.resize();
    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Toolbar ref={mapContainerRef} style={{ height: 350 }}></Toolbar>
      {/* <div className='map-container' ref={mapContainerRef} /> */}
    </div>
  );
};

export default Map;
