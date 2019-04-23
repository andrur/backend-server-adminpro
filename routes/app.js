var express = require('express');

var app = express();

// Rutas // req: request, res: response, next: netxt
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

module.exports = app;