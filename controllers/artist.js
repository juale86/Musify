'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req,res){
	var artistId = req.params.id;
	Artist.findById(artistId, (err,artist) => {
		if(err){
			res.status(500).send({message:"Error en la query"});
		} else {
			if(!artist){
				res.status(404).send({message:"Artista no existe"});
			} else {
				res.status(200).send({artist: artist});
			}
		}
	});
	//res.status(200).send({message:"ArtistController method called"});
}

function saveArtist(req,res){
	// Hacer consulta si el usuario tiene permiso de grabar un artista
	// Hacer middleware para chequeo de permisos
	var artist = new Artist();
	var params = req.body;

	artist.name = params.name;
	artist.description = params.description;
	artist.image = 'null';

	artist.save((err,artistStored) => {
		if (err){
			res.status(500).send({message:"Error al guardar el artista"});
		} else {
			if(!artistStored){
				res.status(404).send({message:"Artista no guardado"});
			} else {
				res.status(200).send({artist: artistStored});
			}
		}
	});
}

function getArtists(req,res){
	if(req.params.page){
		var page = req.params.page;
	} else {
		var page = 1;
	}
	//var itemsPerPage = req.params.
	var itemsPerPage = 4;
	Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
		if(err){
			res.status(500).send({message:"Error en la query"});
		} else {
			if(!artists){
				res.status(404).send({message:"No hay artistas"});
			} else {
				res.status(200).send({
					total_artistas: total,
					artists: artists});
			}
		}
	});
}

function updateArtist(req,res){
	var artistId = req.params.id;
	var update = req.body;

	Artist.findOneAndUpdate(artistId, update, (err, artistUpdated) => {
		//console.log('ARTISTID:',artistId);
		//console.log('UPDATE:',update);
		if(err){
			//console.log("ERR:",err);
			res.status(500).send({message:"Error en la query del Artista"});
		} else {
			if(!artistUpdated){
				res.status(404).send({message:"No se pudo actualizar el artista"});
			} else {
				res.status(200).send({artist: artistUpdated});
			}
		}
	});
}

function deleteArtist(req,res){
	var artistId = req.params.id;

	Artist.findByIdAndRemove(artistId, (err,artistRemoved) => {
		if(err){
			res.status(500).send({message:"Error en la query de delete Artista"});
		} else {
			if(!artistRemoved){
				res.status(404).send({message:"Artista no ha sido eliminado"});
			} else {

				Album.find({artist:artistRemoved._id}).remove((err, albumRemoved)=>{
					if(err){
						res.status(500).send({message:"Error en la query de delete Album"});
					} else {
						if(!albumRemoved){
							res.status(404).send({message:"Album no ha sido eliminado"});
						} else {
							Song.find({album:albumRemoved._id}).remove((err,songRemoved) => {
								if(!err){
									res.status(500).send({message:"Error en la query de delete Song"});
								} else {
									if(!songRemoved){
										res.status(404).send({message:'Song deleted'});
									} else {
										res.status(200).send({artist:artistRemoved});
									}
								}
							});
						}
					}
				});

			}
		}
	});
}

function uploadImage(req,res){
	var artistId = req.params.id;
	var file_name = 'No subido';
	if(req.files){
		var file_path = req.files.image.path;
		//res.status(200).send({message:"Archivo subido correctamente"});
		var file_split = file_path.split('/');
		var file_name = file_split[2];
		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];
		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
			Artist.findByIdAndUpdate(artistId,{image: file_name},(err,artistUpdated) => {
				if(err){
					res.status(500).send({message:'Error al subir la imagen del album.'});
				} else {
					if(!artistUpdated){
						res.status(404).send({message:'No se ha podido actualizar la imagen del album.'});
					} else {
						res.status(200).send({artist: {
							name:artistUpdated.name,
							surname:artistUpdated.surname,
							email: artistUpdated.email
							}
						});
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
	var path_file = './uploads/artists/'+imageFile;
	fs.exists(path_file, (exists) => {
		if (exists){
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({message:'No existe la imagen...'});
		}
	});
}


module.exports = {
	getArtist,
	saveArtist,
	getArtists,
	updateArtist,
	deleteArtist,
	uploadImage,
	getImageFile
}
