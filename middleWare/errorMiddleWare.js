module.exports = function (err, req, res, next) {
    res.status(500).send({
        code : 500,
        err : err
    })
}