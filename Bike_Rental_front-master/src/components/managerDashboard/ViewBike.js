import {
  BikeScooter,
  BikeScooterTwoTone,
  Cancel,
  Check,
  CheckCircle,
  CheckRounded,
  ColorizeSharp,
  CropSquareSharp,
  DeleteForeverOutlined,
  Edit,
  EmojiTransportation,
  Map,
  MonitorWeight,
  TwoWheeler,
  ViewAgenda,
  Visibility,
} from '@mui/icons-material';
import {
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoading } from '../../context/loaderContext';
import api from '../../shared/api';
import Navbar from '../includes/Navbar';
import { StyledTableCell, StyledTableRow } from '../includes/TableStyle';

export const ViewBike = ({ match, location }) => {
  const [bike, setBike] = useState({});
  const [reservations, setReservations] = useState({});

  const loading = useLoading();

  useEffect(() => {
    loading.setLoading(true);
    getBike();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const getBike = async () => {
    let response = await api.manager.getBikes(match.params.id);
    if (response.success) {
      setBike(response.data);
      setReservations(response.reservations);
      loading.setLoading(false);
    }
    loading.setLoading(false);
  };

  return (
    <div>
      <Navbar />
      {bike !== {} && (
        <Container style={{ marginTop: 20 }}>
          <Card variant='outlined'>
            <Toolbar>
              <Typography
                sx={{ flex: '1 1 100%' }}
                color='inherit'
                variant='H1'
                component='h1'
              >
                {bike.model} Bike
              </Typography>
            </Toolbar>
            <Grid
              component='nav'
              container
              aria-label='main mailbox folders'
              style={{ padding: 10 }}
            >
              <ListItemButton sx={4}>
                <ListItemIcon>
                  <ColorizeSharp />
                </ListItemIcon>
                <ListItemText primary={bike.color} />
              </ListItemButton>
              <ListItemButton sx={4}>
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
                  primary={bike.isAvailable ? 'Available' : 'Not Available'}
                />
              </ListItemButton>
            </Grid>

            <Toolbar>
              <Typography
                sx={{ flex: '1 1 100%' }}
                color='inherit'
                variant='H3'
                component='H3'
              >
                Bike Reservations
              </Typography>
            </Toolbar>
            <TableContainer component={Paper} style={{ padding: 10 }}>
              <Table aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>User Name</StyledTableCell>
                    <StyledTableCell align='left'>User Email</StyledTableCell>
                    <StyledTableCell align='left'>Bike Model</StyledTableCell>
                    <StyledTableCell align='left'>Start Date</StyledTableCell>
                    <StyledTableCell align='left'>End Date</StyledTableCell>
                    <StyledTableCell align='left'>Status</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <StyledTableRow key={reservation._id}>
                        <StyledTableCell component='th' scope='row'>
                          {reservation.userId.firstName +
                            ' ' +
                            reservation.userId.lastName}
                        </StyledTableCell>
                        <StyledTableCell component='th' scope='row'>
                          {reservation.userId.email}
                        </StyledTableCell>
                        <StyledTableCell align='left'>
                          {reservation.bikeId.model}
                        </StyledTableCell>
                        <StyledTableCell align='left'>
                          {moment.utc(reservation.startDate).format('LL')}
                        </StyledTableCell>
                        <StyledTableCell align='left'>
                          {moment.utc(reservation.endDate).format('LL')}
                        </StyledTableCell>
                        <StyledTableCell align='left'>
                          <StyledTableCell align='left'>
                            {reservation.status === 'reserved' ? (
                              <CheckCircle />
                            ) : (
                              <Cancel />
                            )}
                          </StyledTableCell>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>No Reservation Data</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Container>
      )}
    </div>
  );
};
