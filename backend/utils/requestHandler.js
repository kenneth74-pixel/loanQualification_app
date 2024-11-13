const isRequestBodyEmpty = (req) => {
    
    return !req.body || Object.keys(req.body).length === 0;
}

module.exports = isRequestBodyEmpty;