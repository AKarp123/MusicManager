

const requireLogin = (req, res, next) => {
    if (req.user) {
        next();
    }
    else {
        res.json({sucess: false, message: "You must be logged in to access this resource"});
    }
}