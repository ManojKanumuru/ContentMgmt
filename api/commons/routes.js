'use strict';

var express = require('express');

let apiRoutes = express.Router();

const jwt = require('./../generics/jwt');

const userController = require('./../controller/userController');

function IsAuthenticated(req,res,next){	
	
	function onVerify(err, data) {
		if(err){
			console.log(err);
	        res.status(401).send(err);
	    }else{
			console.log(data);	
	        next();
	    }
	}
	jwt.verifyToken(req.headers.authorization, onVerify);
}

module.exports = function(app){

	/*user apis*/
	apiRoutes.post('/user/createUser', userController.createUser);

	apiRoutes.post('/user/login', userController.loginUser);
	
	apiRoutes.post('/user/createCategory', userController.createCategory);

	apiRoutes.post('/user/createStaffMembers', userController.createStaffMembers);

	apiRoutes.get('/user/approveUser', userController.approveUser);

	apiRoutes.get('/user/adminCreatedUsers', userController.getAdminCreatedUserList);

	app.use('/api', apiRoutes);
}