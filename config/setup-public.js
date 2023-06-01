const express = require('express');

module.exports = async (app) => {
  app.use('/public', express.static('public'));
};