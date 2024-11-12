const express = require('express');  
const bodyParser = require('body-parser');  
const cors = require('cors');  

const app = express();  
app.use(cors());  
app.use(bodyParser.json());  

const getCredit = require('./routes/route.loanQualification')

app.use("/api/v1", getCredit);

module.exports = app; 