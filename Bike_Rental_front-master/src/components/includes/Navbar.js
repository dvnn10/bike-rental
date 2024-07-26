import { AccountCircle, BikeScooterRounded } from '@mui/icons-material';
import {
  AppBar,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  getUserInfo,
  isAuthenticated,
  logout,
  redirectHelper,
} from '../../shared/helper';

const Navbar = () => {
  const isAuth = isAuthenticated();
  const user = getUserInfo();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const myProfile = () => {
    history.push(`/${user.role}/profile`);
  };

  return (
    <AppBar position='static' color='default' elevation={0}>
      <div position='realtive'>
        <Container position='static' color='default' elevation={0}>
          <Toolbar
            style={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
          >
            <Toolbar component={Button} onClick={() => history.push('/')}>
              <BikeScooterRounded />
              <Typography varaint='h1' style={{ paddingLeft: 50 }}>
                Bike Rental
              </Typography>
            </Toolbar>
            {isAuth ? (
              <Toolbar>
                {user.role === 'manager' ? (
                  <>
                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/manager/bikes'}
                      style={{ padding: 10 }}
                    >
                      Bikes
                    </Button>
                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/manager/users'}
                      style={{ padding: 10 }}
                    >
                      Users
                    </Button>
                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/manager/reservations'}
                      style={{ padding: 10 }}
                    >
                      Reservations
                    </Button>
                  </>
                ) : (
                  <div>
                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/user/bikes'}
                      style={{ padding: 10 }}
                    >
                      Bikes
                    </Button>
                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/user/reservations'}
                      style={{ padding: 10 }}
                    >
                      Reservation
                    </Button>

                    <Button
                      color='secondary'
                      variant='text'
                      component={Link}
                      to={'/user/map'}
                      style={{ padding: 10 }}
                    >
                      Bike Map
                    </Button>
                  </div>
                )}

                <IconButton
                  size='large'
                  aria-label='account of current user'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleMenu}
                  color='inherit'
                >
                  <AccountCircle />
                </IconButton>

                <Menu
                  id='menu-appbar'
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={myProfile}>My Profile</MenuItem>
                  <MenuItem onClick={() => logout(history)}>Logout</MenuItem>
                </Menu>
              </Toolbar>
            ) : (
              <Toolbar>
                <Button color='primary' variant='outlined'>
                  Sign In/Up
                </Button>
              </Toolbar>
            )}
          </Toolbar>
        </Container>
      </div>
    </AppBar>
  );
};

export default Navbar;
