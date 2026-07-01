const express = require('express');
const productRoutes = require('./routes/product.routes');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API functioning correctly'
    });
});

app.use('/products', productRoutes);
app.use(errorHandler);

module.exports = app;