const express = require('express');
const productRoutes = require('./routes/product.routes');
const salesRoutes = require('./routes/sales.routes');
const categoryRoutes = require('./routes/category.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API functioning correctly'
    });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;