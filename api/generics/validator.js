'use strict';

 var Joi= require('joi');

 var _ = require('underscore');

 var errorCodes = require('./errorCodes');

const schema = {
	userName	    :	Joi.string().required().trim().label(errorCodes.errorMessages.userNameRequired),
	password	    :	Joi.string().required().trim().label(errorCodes.errorMessages.passwordRequired),
	userRole	    :	Joi.string().required().trim().label(errorCodes.errorMessages.userRoleRequired),
    officialEmail	: 	Joi.string().required().label(errorCodes.errorMessages.officialEmailRequired),
    firstName       :   Joi.string().label(errorCodes.errorMessages.firstNameTypeError),
    lastName        :   Joi.string().label(errorCodes.errorMessages.lastNameTypeError)
}

exports.validateUserKeys = function(request){
	return new Promise(function(resolve, reject){

        Joi.validate(request, schema, function(err, value){
            if(err && Array.isArray(err.details) && err.details.length) {
				if(err.details[0].type === "object.allowUnknown"){
					return reject(err.details[0].message.replace(/"/g,""));
				}else{
					return reject(err.details[0].message.split('"')[1]);
				} 
            } else {
                return resolve();
            }
		});
	});
}

const categorySchema = {
	categoryName	:	Joi.string().required().label(errorCodes.errorMessages.categoryNameRequired),
	categoryType	:	Joi.string().required().label(errorCodes.errorMessages.categoryTypeRequired),
	createdBy	    :	Joi.string().required().label(errorCodes.errorMessages.createdByRequired)
};

exports.validateCreateCategoryKeys = function(request){
	
	return new Promise(function(resolve, reject){
        Joi.validate(request, categorySchema, function(err, value){
            if(err && Array.isArray(err.details) && err.details.length) {
				if(err.details[0].type === "object.allowUnknown"){
					return reject(err.details[0].message.replace(/"/g,""));
				}else{
					return reject(err.details[0].message.split('"')[1]);
				} 
            } else {
                return resolve();
            }
		});
	});
}

exports.validateStaffList = function(request){

	return new Promise(function(resolve, reject){
		
		if(!request.hasOwnProperty('staffList') || !request.staffList.length){
			return reject('staff members cannot be empty');
		}
		let isNotValid = false;
		_.each(request.staffList, function(obj){
			if(!obj.userName || !obj.officialEmail){
				isNotValid = true;
				return;
			}
		});

		if(isNotValid){
			return reject('one of the staff members request is not valid');
		}else{
			return resolve();
		}
	})
}
