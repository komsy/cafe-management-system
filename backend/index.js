const express = require('express');
var cors = require('cors');
const connection = require('./connection');
const userRoute = require('./routes/user');
const docPropertyRoute = require('./routes/docProperty');
const menuItemsRoute = require('./routes/menuItems');
const departmentRoute = require('./routes/department');
const categoryRoute = require('./routes/category');
const productRoute = require('./routes/product');
const billRoute = require('./routes/bill');
const dashboardRoute = require('./routes/dashboard');
const app = express();

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/user',userRoute);
app.use('/menuItems',menuItemsRoute);
app.use('/docProperty',docPropertyRoute);
app.use('/department',departmentRoute);
app.use('/category',categoryRoute);
app.use('/product',productRoute);
app.use('/bill',billRoute);
app.use('/dashboard',dashboardRoute);

module.exports = app;