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

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const loading = useLoading();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteUser, setDeleteUser] = useState('');

  const getUsers = async () => {
    try {
      let param = 'all';
      let response = await api.manager.getUsers(param);
      setUsers(response.data);
      loading.setLoading(false);
    } catch (err) {
      loading.setLoading(false);
    }
  };

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />;
  });

  useEffect(() => {
    loading.setLoading(true);
    getUsers();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const handleClickOpen = () => {
    setDeleteDialog(true);
  };

  const handleClose = () => {
    setDeleteDialog(false);
  };

  const deleteSelectedUser = async () => {
    handleClose();
    loading.setLoading(true);
    let response = await api.manager.deleteUser(deleteUser);
    if (response.success) {
      toast.warn('User Deleted Successfully');
      getUsers();
    } else {
      toast.warn('Something went wrong');
      loading.setLoading(false);
    }
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
              Users
            </Typography>
            <Button
              component={Link}
              to={'/manager/users/add'}
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
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell align='left'>Username</StyledTableCell>
                  <StyledTableCell align='left'>Email</StyledTableCell>
                  <StyledTableCell align='left'>Phone Number</StyledTableCell>
                  <StyledTableCell align='left'>Role</StyledTableCell>
                  <StyledTableCell align='left'>Status</StyledTableCell>
                  <StyledTableCell align='left'>Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <StyledTableRow key={user._id}>
                      <StyledTableCell component='th' scope='row'>
                        {user.firstName + ' ' + user.lastName}
                      </StyledTableCell>
                      <StyledTableCell component='th' scope='row'>
                        {user.username}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {user.email}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {user.contactNumber}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {user.role}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {user.status === 'active' ? (
                          <CheckCircle />
                        ) : (
                          <Cancel />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        <IconButton
                          aria-label='View'
                          component={Link}
                          to={`/manager/users/view/${user._id}`}
                        >
                          <Visibility />
                        </IconButton>

                        <IconButton
                          component={Link}
                          to={`/manager/users/${user._id}`}
                          aria-label='Edit'
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          aria-label='delete'
                          onClick={() => {
                            setDeleteUser(user._id);
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
                    <TableCell colSpan={6}>No Bike Data</TableCell>
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
                <DialogTitle>{'Delete User?'}</DialogTitle>
                <DialogContent>
                  <DialogContentText id='alert-dialog-slide-description'>
                    Once the user is deleted, it cannot be restored or recovered
                    at any means.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={() => deleteSelectedUser()}>Delete</Button>
                </DialogActions>
              </Dialog>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </div>
  );
};
