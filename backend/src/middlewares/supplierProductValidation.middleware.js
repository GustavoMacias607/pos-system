const {
    validateCreateSupplierProductInput,
    validateUpdateSupplierProductInput,
    validatePositiveIntegerParam
} = require('../validators/supplierProduct.validator');

const validateCreateSupplierProductData = (req, res, next) => {
    try {
        validateCreateSupplierProductInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateUpdateSupplierProductData = (req, res, next) => {
    try {
        validateUpdateSupplierProductInput(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

const validateSupplierProductParams = (req, res, next) => {
    try {
        validatePositiveIntegerParam(
            req.params.supplierId,
            'Supplier ID'
        );

        if (req.params.productId !== undefined) {
            validatePositiveIntegerParam(
                req.params.productId,
                'Product ID'
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCreateSupplierProductData,
    validateUpdateSupplierProductData,
    validateSupplierProductParams
}