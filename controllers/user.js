'use strict'

const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');
//require('mongoose/lib/services/updateValidators');

function pruebas(req,res){
	console.log('IP: ',req);
	res.status(200).send({
		message:'Probando el controlador de usuarios'
	});
}

function saveUser(req,res){
	var params = req.body;
	if (/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(params.email)){
		if(!params.role){
			// Intento de guardar con role
			res.status(403).send({message:'Te estás asignando un rol'});
			//console.log('Intento de guardar con role al usuario: ',params.name,' ',params.surname);
		} else {
			User.findOne({email:params.email.toLowerCase()},(err,user) => {
				if(err){
					res.status(500).send('Error al realizar la petición');
				} else {
					if(!user){
						var user = new User();
						user.email = params.email;
						user.name = params.name;
						user.surname = params.surname;
						user.role = 'ROLE_USER';
						user.image = null;
						if(params.password){
							// Encriptar contraseña y guardar
							bcrypt.hash(params.password,null, null, function(err,hash){
								user.password = hash;
								if(user.name != null && user.surname !=null && user.email != null){
									// Guardar el usuario
									user.save((err, userStored) => {
										if(err){
											res.status(500).send({menssage:'Error al guardar el usuario'});
										} else {
											if(!userStored){
												res.status(404).send(({menssage:'Usuario no registrado'}));
											} else {
												res.status(200).send({user:{
														_id: userStored.id,
														name:userStored.name,
														surname:userStored.surname,
														email:userStored.email
													}
												});
											}
										}
									});
								} else {
									res.status(200).send(({menssage:'Rellena todos los campos'}));
								}
							});
						} else {
							res.status(500).send(({menssage:'Introduce la contraseña'}));
						}
					} else {
						res.status(404).send({message:'Usuario ya existe'});
					}
				}
			});
		}
	} else {
		// Email no cumple RegExp
		console.log('Email no cumple RegExp');
		res.status(403).send({message:'Email inválido'});
	}
}

function loginUser(req,res){
	var params = req.body;
	var email = params.email;
	var password = params.password;
	User.findOne({email:email.toLowerCase()},(err,user)=>{
		if(err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!user){
				res.status(404).send({message:'Usuario no existe'});
			} else {
				//Comprobamos la contraseña
				bcrypt.compare(password, user.password,function(err,check){
					if(check){
						// Devolver los datos del usuario logueado
						if(params.getHash){
							//Devolver un token jwt
							//console.log('USER: ',user);
							res.status(200).send({token:jwt.createToken(user)})
						} else {
							res.status(200).send({user});
						}
					} else {
						res.status(404).send({message:'El usuario no se ha podido loguear'});
					}
				});
			}
		}
	});
}

function updateUser(req,res){
	var userId = req.params.id;
	var update = req.body;
	if(userId != req.body._id){
		return res.status(500).send({message:'No tienes permiso para actualizar éste usuario'});
	}

	//if (!update.role) {
		User.findByIdAndUpdate(userId,update,(err,userUpdated) => {
			if(err){
				res.status(500).send({message:'Error al actualizar el usuario'});
			} else {
				if(!userUpdated){
					res.status(404).send({message:'No se ha podido actualizar el usuario'});
				} else {
					//console.log('userUpdated:',userUpdated);
					//res.status(200).send({user: {
						//sur
						//name: userUpdated.name,
						//surname: userUpdated.surname,
						//email: userUpdated.email
						//}
					//});
					res.status(200).send({user:userUpdated});
				}
			}
		});
	//} else {
		//// Intentando cambiar el role
		//res.status(401).send({message:'Error en el servidor'})
	//}
}

//function resetPass(req,res){}

function uploadImage(req,res){
	var userId = req.params.id;
	var file_name = 'No subido';
	if(req.files){
		var file_path = req.files.image.path;
		//res.status(200).send({message:"Archivo subido correctamente"});
		var file_split = file_path.split('/');
		var file_name = file_split[2];
		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userId,{image: file_name},(err,userUpdated) => {
				if(err){
					res.status(500).send({message:'Error al subir el usuario'});
				} else {
					if(!userUpdated){
						res.status(404).send({message:'No se ha podido actualizar el usuario'});
					} else {
						res.status(200).send({user: userUpdated,image:file_name});
					}
				}
			});
		} else {
			res.status(200).send({message:"Extensión no válida"});
		}
	} else {
		res.status(200).send({message:'No se ha subido ninguna imagen'})
	}
}

function getImageFile(req,res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;
	fs.exists(path_file, (exists) => {
		if (exists){
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({message:'No existe la imagen...'});
		}
	});
}

module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};
