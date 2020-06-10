'use strict';

var jwt = require('jsonwebtoken');

exports.generateToken = function(userId){
	console.log("inside generateToken");
	let token = jwt.sign({
		"userId" : userId
	}, 'shhhhh', { expiresIn: 3600 });

	return token;
};

exports.verifyToken = function(token, callback){
	jwt.verify(token, 'shhhhh', (err,decodedToken) => {
		if(err){
			return callback(err,null);
		}
		else
		{
			return callback(null,decodedToken);
		}
	});
}