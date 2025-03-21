const customError = require('../utils/customError');

const sessionAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next(new customError('Authentication required', 401));
    }
    next();
};

module.exports = { sessionAuth };
