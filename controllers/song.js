'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePagination = require('mongoose-pagination');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req,res){
	var songId = req.params.id;
	Song.findById(songId).populate({path:'album'}).exec((err,song) => {
		if(err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!song){
				res.status(404).send({message:'La canción no existe'});
			} else {
				res.status(200).send({song:song});
			}
		}
	});
}

function saveSong(req,res){
	var song = new Song();

	var params = req.body;
	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = null;
	song.album = params.album;

	song.save((err,songStored) => {
		if(err){
			res.status(500).send({message:err})
		} else {
			if(!songStored){
				res.status(404).send({message:'No se ha guardado la canción'})
			} else {
				res.status(200).send({song:songStored});
			}
		}
	});
}

function getSongs(req,res){
	var albumId = req.params.album;

	if(!albumId){
		var find = Song.find({}).sort('number');
	} else {
		var find = Song.find({album:albumId}).sort('number');
	}

	find.populate({
		path:'album',
		populate:{
			path:'artist',
			model:'Artist'
		}
	}).exec((err,songs) =>{
		if(err){
			res.status(500).send({message:'Error en la petición'});
		} else {
			if(!songs){
				res.status(404).send({message:'No se hay canciones'})
			} else {
				res.status(200).send({songs});
			}
		}
	});
}

function updateSong(req,res){
	var songId = req.params.id;
	var update = req.body;
	Song.findByIdAndUpdate(songId,update,(err,songUpdated) => {
		if(err){
			res.status(500).send({message:'Error en el servidor'});
		} else {
			if(!songUpdated){
				res.status(404).send({message:'No se actualizó la canción'})
			} else {
				res.status(200).send({song:songUpdated});
			}
		}
	});
}

function deleteSong(req,res){
	var songId = req.params.id;
	Song.findByIdAndDelete(songId,(err,songRemoved) => {
		if(err){
			res.status(500).send({message:'Error en el servidor'});
		} else {
			if(!songRemoved){
				res.status(404).send({message:'No se borrado la canción'})
			} else {
				res.status(200).send({song:songRemoved});
			}
		}
	});
}

function uploadFile(req,res){
	var songId = req.params.id;
	var file_name = 'No subido';
	if(req.files){
		var file_path = req.files.file.path;
		//res.status(200).send({message:"Archivo subido correctamente"});
		var file_split = file_path.split('/');
		var file_name = file_split[2];
		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];
		if(file_ext == 'mp3' || file_ext == 'ogg'|| file_ext == 'mp4'){
			Song.findByIdAndUpdate(songId,{file: file_name},(err,songUpdated) => {
				if(err){
					res.status(500).send({message:'Error al subir la canción.'});
				} else {
					if(!songUpdated){
						res.status(404).send({message:'No se ha podido actualizar la imagen del album.'});
					} else {
						res.status(200).send({song: songUpdated});
					}
				}
			});
		} else {
			res.status(200).send({message:"Extensión no válida"});
		}
	} else {
		res.status(200).send({message:'No se ha subido ninguna canción'})
	}
}

function getSongFile(req,res){
	var songFile = req.params.songFile;
	var path_file = './uploads/songs/'+songFile;
	fs.exists(path_file, (exists) => {
		if (exists){
			console.log('La canción si existe');
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({message:'No existe la canción...'});
		}
	});
}

module.exports = {
	getSong,
	saveSong,
	getSongs,
	updateSong,
	deleteSong,
	uploadFile,
	getSongFile
}