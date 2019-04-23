var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autentificacion');
//var SEED = require('../config/config').SEED; //simplificado: agrego .SEED

var app = express();

var Usuario = require('../models/usuario');

// =================================
// Obtener todos los usuarios
// =================================
app.get('/', (req, res, next) => {

    //(gracias a mongoose puedo usar esto:)
    Usuario.find({}, 'nombre email img role')
        .exec(

            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                });



            })
});




// =================================
// Actualizar Usuario
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID.' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });

            }

            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });
});

// =================================
// Crear Nuevo Usuario
// =================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    //extraemos el body
    var body = req.body; // funcion de body parser libreria

    //creamos objeto de tipo Usuario; Inicializamos
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usaurio',
                errors: err
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuaritoken: req.usuario
        });
    });

});

// =================================
// Borrar un usuario por el id
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => { // id, callback

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usaurio',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario' }
            });
        }


        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    });


});

module.exports = app;