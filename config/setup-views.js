const { json, urlencoded } = require('express');
const path = require('path');

module.exports = async (app) => {
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'ejs');
};