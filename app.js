require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const corsConfig = require('./configs/cors.config')

const columnRoutes = require('./routes/columns.routes');
const cardsRoutes = require('./routes/cards.routes');

require('./configs/db.config');

const session = require('./configs/session.config');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session);

app.use(cors())

app.use('/columns',cors(corsConfig), columnRoutes);
app.use('/cards',cors(corsConfig), cardsRoutes);

app.use((req, res, next) => {
  res.locals.session = req.user;
  next();
})

// 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (error, req, res, next) {
  console.error(error);

  res.status(error.status || 500);

  const data = {}

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400);
    for (field of Object.keys(error.errors)) {
      error.errors[field] = error.errors[field].message
    }
    data.errors = error.errors
  } else if (error instanceof mongoose.Error.CastError) {
    error = createError(404, 'Resource not found')
  }

  data.message = error.message;
  res.json(data);
});

module.exports = app;
