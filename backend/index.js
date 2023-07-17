const express = require('express');
const configureMiddleware = require('./middleware');
const configureRoutes = require('./routes');


const app = express();


configureMiddleware(app);

configureRoutes(app);

const server = app.listen(process.env.PORT, '0.0.0.0', ()=>{
    console.log("up")
})