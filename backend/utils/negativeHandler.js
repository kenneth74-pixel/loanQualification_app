const hasNegativeIntegers = (value) => {
    // return value < 0;
    const number = Number(value);
    if (isNaN(number) || value === "" || typeof value === "string" || number < 0) {
        return true;
    }

    return false;
}


module.exports = hasNegativeIntegers;