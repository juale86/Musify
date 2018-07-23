'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.connect('mongodb://localhost:27017/musify',(err,res) =>{
	if(err){
		throw err;
	} else {
		console.log('base de datos corriendo correctamente');
		app.listen(port,function(){
			console.log('servidor corriendo');
		});
	}
});
