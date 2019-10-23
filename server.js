'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');

const app = express();

app.use(cors());
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => console.log(`App is on port ${PORT}`));

//Get the location and name to be used else where
app.get('/location', (request, response) => {
  const location = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`

  superagent.get(url)
    .then(data => {
      const city = new City(location, data.body);
      response.send(city);
    })
    .catch(error => {
      response.send(error).status(500);
    });
});

//Create an array of the weather and return that to the webpage
app.get('/weather', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${currentCity.latitude},${currentCity.longitude}`;

  superagent.get(url)
    .then(data => {

      const forcastList = data.body.daily.data.map(dailyWeather => new Forcast(dailyWeather));
      response.send(forcastList);

    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });

});

app.get('/yelp', (request, response) => {

  const currentCity = request.query.data;
  const url = `https://api.yelp.com/v3/businesses/search?location=${currentCity.location}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {

      response.send(data.body);
    })
    .catch(error => {

      console.error(error);
      response.send(error).status(500);

    });
});

//404 all unwanted extentions
app.get('*', (request, responce) => {
  responce.status(404);
});

/**
 * End of Path Functions
 * 
 * Start Helper Functions
 */

function City(location, data) {

  this.search_query = location;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;

}

function Forcast(day) {

  this.forecast = day.summary;
  let date = new Date(day.time * 1000);
  this.time = date.toDateString();

}

