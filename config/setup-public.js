const express = require('express');

module.exports = (app) => {
  app.use('/public', express.static('public'));
};
