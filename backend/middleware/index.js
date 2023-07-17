const express = require('express');
const expressRateLimit = require('express-rate-limit');
const cors = require('cors')
const hpp = require('hpp')

const configureMiddleware = (app) => {
    app.use(express.json());

    app.use(cors());

    app.use(hpp())

    app.use(expressRateLimit({
        windowMs: 5 * 60 * 1000, // 15 minutes
        max: 15
    }))
}

module.exports = configureMiddleware;
