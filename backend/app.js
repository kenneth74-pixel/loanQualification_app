const express = require('express');  
const bodyParser = require('body-parser');  
const cors = require('cors');  

const errorMiddleware = require("./middleware/errors");

const app = express();  
app.use(cors());  
app.use(bodyParser.json());  


const getCredit = require('./routes/route.loanQualification')

app.use("/api/v1", getCredit);

app.use(errorMiddleware);

module.exports = app; 