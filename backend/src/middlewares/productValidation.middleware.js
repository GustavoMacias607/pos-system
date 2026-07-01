const validateProductData = (req, res, next) => {
    const { name, price, stock } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Product name is required'
        });
    }

    if (price === undefined || price < 0) {
        return res.status(400).json({
            success: false,
            message: 'Product price must be greater than or equal to 0'
        });
    }

    if (stock === undefined || stock < 0) {
        return res.status(400).json({
            success: false,
            message: 'Product stock must be greater than or equal to 0'
        });
    }

    next();
};

module.exports = {
    validateProductData
};