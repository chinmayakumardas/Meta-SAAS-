const sanitize = (input) => {
    if (typeof input === 'string') {
        return input.replace(/[<>"'`;(){}]/g, '');
    }
    if (typeof input === 'object' && input !== null) {
        Object.keys(input).forEach((key) => {
            input[key] = sanitize(input[key]);
        });
    }
    return input;
};

module.exports = { sanitize };
