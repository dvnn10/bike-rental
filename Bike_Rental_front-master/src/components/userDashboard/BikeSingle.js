import React from 'react';
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
import urls from '../../shared/url';

const BikeSingle = ({ bike }) => {
  const imagePath = JSON.parse(bike.images);
  console.log(JSON.parse(bike.images));
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
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
                <Check />
              </ListItemIcon>
              <ListItemText
                primary={bike.isAvailable ? 'Available' : 'Not Available'}
              />
            </ListItemButton>
          </List>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BikeSingle;
