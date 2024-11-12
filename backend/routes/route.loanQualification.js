const express = require("express");
const router = express.Router();

const {
    getCreditScore
} = require('../controllers/loanQualification');


router.route("/loan/borrow").post(getCreditScore);

module.exports = router;