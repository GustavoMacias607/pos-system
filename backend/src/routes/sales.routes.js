const express = require('express');
const salesController = require('../controllers/sales.controller');
const { validateSaleData } = require('../middlewares/salesValidation.middleware');

const router = express.Router();


router.get('/', salesController.getSales);
router.post('/', validateSaleData, salesController.createSale);
router.get('/:id', salesController.getSale);
router.post('/:id/cancel', salesController.cancelSale);

module.exports = router;