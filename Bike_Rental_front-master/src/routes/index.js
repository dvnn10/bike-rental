import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { isAuthenticated, getUserInfo } from '../shared/helper';
import { toast } from 'react-toastify';
import { ManagerDashboard } from '../components/managerDashboard/ManagerDashboard';
import { ManageBikes } from '../components/managerDashboard/ManageBikes';
import { ManageReservation } from '../components/managerDashboard/ManageReservation';
import { ManageUsers } from '../components/managerDashboard/ManageUsers';

import { UserDashboard } from '../components/userDashboard/UserDashboard';
import { Bikes } from '../components/userDashboard/Bikes';
import { Profile } from '../components/userDashboard/Profile';
import { Reservation } from '../components/userDashboard/Reservation';
import { AddEditBikes } from '../components/managerDashboard/AddEditBikes';
import { AddEditUser } from '../components/managerDashboard/AddEditUsers';
import { ViewBike } from '../components/managerDashboard/ViewBike';
import { ViewUser } from '../components/managerDashboard/ViewUser';
import { ManageProfile } from '../components/managerDashboard/ManageProfile';
import Map from '../components/userDashboard/Map';
import { ForgotPassword } from '../components/auth/ForgotPassword';

const AppRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => <Component {...props} />}></Route>
);

const PrivateRoute = ({ component: Component, ...rest }) => {
  const Authenticated = isAuthenticated();
  const userInfo = getUserInfo();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (Authenticated && userInfo.role === 'user') {
          return <Component {...props} />;
        } else {
          toast.error('Something went wrong. Redirected to your dashboard');
          return (
            <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />
          );
        }
      }}
    />
  );
};

const ManagerRoute = ({ component: Component, ...rest }) => {
  const Authenticated = isAuthenticated();
  const userInfo = getUserInfo();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (Authenticated && userInfo.role === 'manager') {
          return <Component {...props} />;
        } else {
          toast.error('Something went wrong. Redirected to your dashboard');
          return (
            <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />
          );
        }
      }}
    />
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className='wrapper'>
        <Switch>
          <AppRoute path='/' exact component={Login}></AppRoute>
          <AppRoute path='/home' component={Login}></AppRoute>
          <AppRoute path='/login' component={Login}></AppRoute>
          <AppRoute path='/register' component={Register}></AppRoute>
          <AppRoute path='/forgotPass' component={ForgotPassword}></AppRoute>

          <PrivateRoute path='/user' exact component={Bikes}></PrivateRoute>
          <PrivateRoute
            path='/user/bikes'
            exact
            component={Bikes}
          ></PrivateRoute>
          <PrivateRoute path='/user/map' exact component={Map}></PrivateRoute>
          <PrivateRoute
            path='/user/reservations'
            exact
            component={Reservation}
          ></PrivateRoute>
          <PrivateRoute
            path='/user/profile'
            exact
            component={Profile}
          ></PrivateRoute>

          <ManagerRoute
            path='/manager/bikes/view/:id'
            exact
            component={ViewBike}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager/bikes/:type'
            exact
            component={AddEditBikes}
          ></ManagerRoute>

          <ManagerRoute
            path='/manager/bikes'
            exact
            component={ManageBikes}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager/users'
            exact
            component={ManageUsers}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager/users/view/:id'
            exact
            component={ViewUser}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager/users/:type'
            exact
            component={AddEditUser}
          ></ManagerRoute>

          <ManagerRoute
            path='/manager/reservations'
            exact
            component={ManageReservation}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager/profile'
            exact
            component={ManageProfile}
          ></ManagerRoute>
          <ManagerRoute
            path='/manager'
            exact
            component={ManagerDashboard}
          ></ManagerRoute>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
