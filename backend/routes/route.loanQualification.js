const express = require("express");
const router = express.Router();

const {
    getCreditScore,
    createCreditScore
} = require('../controllers/loanQualification');


router.route("/loan/borrow").post(getCreditScore);
router.route("/finance/details").post(createCreditScore);

module.exports = router;