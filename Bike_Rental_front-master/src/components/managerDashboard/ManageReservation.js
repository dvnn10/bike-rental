import {
  Cancel,
  CancelOutlined,
  CheckCircle,
  CheckRounded,
  CropSquareSharp,
  DeleteForeverOutlined,
  Edit,
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
  IconButton,
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

export const ManageReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReservation, setCancelReservation] = useState('');

  const loading = useLoading();

  useEffect(() => {
    loading.setLoading(true);
    getReservations();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />;
  });

  const handleClickOpen = () => {
    setCancelDialog(true);
  };

  const handleClose = () => {
    setCancelDialog(false);
  };

  const cancelSelectedReservation = async () => {
    handleClose();
    loading.setLoading(true);
    let response = await api.manager.cancelReservation({
      reservationId: cancelReservation,
    });
    if (response.success) {
      toast.warn('Reservation Cancelled Successfully');
      getReservations();
    } else {
      toast.warn('Something went wrong');
      loading.setLoading(false);
    }
  };

  const getReservations = async () => {
    let param = 'all';
    let response = await api.manager.getReservations(param);
    if (response.success) {
      setReservations(response.data);
      loading.setLoading(false);
    }
    loading.setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <Container style={{ marginTop: 20 }}>
        <Card variant='outlined'>
          <Toolbar>
            <Typography
              sx={{ flex: '1 1 100%' }}
              color='inherit'
              variant='H1'
              component='h1'
            >
              Reservations
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
                  <StyledTableCell align='left'>Actions</StyledTableCell>
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
                      <StyledTableCell align='left'>
                        <IconButton
                          aria-label='delete'
                          disabled={reservation.status === 'cancelled'}
                          onClick={() => {
                            setCancelReservation(reservation._id);
                            handleClickOpen();
                          }}
                        >
                          <CancelOutlined />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>No Reservation Data</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <Dialog
                open={cancelDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                onBackdropClick={handleClose}
                aria-describedby='alert-dialog-slide-description'
              >
                <DialogTitle>{'Cancel Reservation?'}</DialogTitle>
                <DialogContent>
                  <DialogContentText id='alert-dialog-slide-description'>
                    Once the reservation is cancelled, it cannot be reactivated.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Back</Button>
                  <Button onClick={() => cancelSelectedReservation()}>
                    Cancel Reservation
                  </Button>
                </DialogActions>
              </Dialog>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </div>
  );
};
