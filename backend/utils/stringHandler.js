const stringsOnly = (value) => {
    if (typeof value !== 'string' || value.trim() === '') {
        return true;
    }

    return false;
}


module.exports = stringsOnly;