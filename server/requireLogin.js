

const requireLogin = (req, res, next) => {
    if (req.user) {
        next();
    }
    else {
        res.json({success: false, message: "You must be logged in to access this resource"});
    }
}