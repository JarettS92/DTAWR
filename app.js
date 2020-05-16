const http = require('http');
const express = require('express');
const ejs = require('ejs');
const app = express();
require('dotenv').config();

const courses = [{
    id: 1,
    name: 'course1'
  },
  {
    id: 2,
    name: 'course2'
  },
  {
    id: 3,
    name: 'course3'
  }
];

// PORT
const port = process.env.PORT || 3000;

// Settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', (req, res) => {
  res.render("index");
});

app.get('/dashboards', (req, res) => {
  res.render('dashboards');

});

app.get('/summary', (req, res) => {
  res.render('summary');
});

app.get('/artifacts', (req, res) => {
  res.render('artifacts');
});

app.get('/reports', (req, res) => {
  res.render('reports');
});

app.get('/tools', (req, res) => {
  res.render('tools');
});

app.listen(port, () => {
  console.log("Server is listening on port: ", port);
});