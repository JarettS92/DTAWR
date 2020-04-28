const http = require('http');
const express = require('express');
const app = express();
require('dotenv').config();

const courses = [
  {id: 1, name: 'course1'},
  {id: 2, name: 'course2'},
  {id: 3, name: 'course3'}
];

// PORT
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("Hello world!");
});

app.get('/api/courses', (req, res) => {
  let obj = {
    "this": "is",
    "Some": "standard",
    "JSON": "format"
  }
  res.send(obj);
});

app.get('/api/courses/:id', (req, res) => {
  let course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) {
    res.status(404).send('The course with given id was not found!');
  } else {
    res.send(course);
  }
});

app.listen(port, () => {
  console.log("Server is listening on port: ", port);
});