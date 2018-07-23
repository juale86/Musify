'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clavesita';

exports.ensureAuth = function(req,res,next){
	if(!req.headers.authorization){
		return res.status(403).send({message:'Petición no tiene cabecera de autenticación'});
	}
	var token = req.headers.authorization.replace(/['"]+/g,'');
	try{
		var payLoad = jwt.decode(token,secret);
		if(payLoad.exp < moment().unix()){
			res.status(404).send({message:'Token expirado'})
		}
	}catch(ex){
		//console.log(ex)
		return res.status(404).send({message:'token no válido'});
	}

	req.user = payLoad;
	next();
}