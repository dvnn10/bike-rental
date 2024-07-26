import {
  BikeScooter,
  BikeScooterTwoTone,
  Cancel,
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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoading } from '../../context/loaderContext';
import api from '../../shared/api';
import Navbar from '../includes/Navbar';
import { StyledTableCell, StyledTableRow } from '../includes/TableStyle';

export const ManageBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteBike, setDeleteBike] = useState('');

  const loading = useLoading();

  useEffect(() => {
    loading.setLoading(true);
    getBikes();

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
    setDeleteDialog(true);
  };

  const handleClose = () => {
    setDeleteDialog(false);
  };

  const deleteSelectedBike = async () => {
    handleClose();
    loading.setLoading(true);
    let response = await api.manager.deleteBike(deleteBike);
    if (response.success) {
      toast.warn('Bike Deleted Successfully');
      getBikes();
    } else {
      toast.warn('Something went wrong');
      loading.setLoading(false);
    }
  };

  const getBikes = async () => {
    let param = 'all?limit=10';
    let response = await api.manager.getBikes(param);
    if (response.success) {
      setBikes(response.data.bikes);
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
              Bikes
            </Typography>
            <Button
              component={Link}
              to={'/manager/bikes/add'}
              color='primary'
              variant='outlined'
            >
              Add
            </Button>
          </Toolbar>
          <TableContainer component={Paper} style={{ padding: 10 }}>
            <Table aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Bike Model</StyledTableCell>
                  <StyledTableCell align='left'>Color</StyledTableCell>
                  <StyledTableCell align='left'>Address</StyledTableCell>
                  <StyledTableCell align='left'>Brand</StyledTableCell>
                  <StyledTableCell align='left'>Weight</StyledTableCell>
                  <StyledTableCell align='left'>Available</StyledTableCell>
                  <StyledTableCell align='left'>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bikes.length > 0 ? (
                  bikes.map((bike) => (
                    <StyledTableRow key={bike._id}>
                      <StyledTableCell component='th' scope='row'>
                        {bike.model}
                      </StyledTableCell>
                      <StyledTableCell component='th' scope='row'>
                        {bike.color}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {bike.address}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {bike.brand}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {bike.weight}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {bike.isAvailable ? <CheckCircle /> : <Cancel />}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        <IconButton
                          component={Link}
                          aria-label='View'
                          to={`/manager/bikes/view/${bike._id}`}
                        >
                          <Visibility />
                        </IconButton>

                        <IconButton
                          component={Link}
                          to={`/manager/bikes/${bike._id}`}
                          aria-label='Edit'
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          aria-label='delete'
                          onClick={() => {
                            setDeleteBike(bike._id);
                            handleClickOpen();
                          }}
                        >
                          <DeleteForeverOutlined />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>No Bike Data</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <Dialog
                open={deleteDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                onBackdropClick={handleClose}
                aria-describedby='alert-dialog-slide-description'
              >
                <DialogTitle>{'Delete Bike?'}</DialogTitle>
                <DialogContent>
                  <DialogContentText id='alert-dialog-slide-description'>
                    Once the bike is deleter, it cannot be restored or recovered
                    at any means.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={() => deleteSelectedBike()}>Delete</Button>
                </DialogActions>
              </Dialog>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </div>
  );
};
