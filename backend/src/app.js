const express = require('express');
const productRoutes = require('./routes/product.routes');
const salesRoutes = require('./routes/sales.routes');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API functioning correctly'
    });
});

app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use(errorHandler);

module.exports = app;