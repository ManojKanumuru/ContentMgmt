'use strict';

var Promise = require('bluebird');

const responses = require('./../generics/responses.js');

const constants = require('./../generics/constants.js');

const userDal = require('./../dal/userDal.js');

const crypto = require('crypto');

const jwt = require('./../generics/jwt');

let validator = require('./../generics/validator');

const errorCodes = require('./../generics/errorCodes');

var _ = require('underscore');

const { v4: uuidv4 } = require('uuid');

let remoteApis = require('./../remoteApis/remote');

var config = require('./../../config/devConfig.json');

var path = require('path')

exports.createUser = function(req, res){

	console.log("createUser:"+JSON.stringify(req.body));
	let request = {};
		request = req.body;

	Promise.coroutine(function *(){

		yield validator.validateUserKeys(request);

		yield validateUserCreation(request);

		let userCreation = yield userDal.userCreation(request);
		
		console.log("userCreation---->>>>:",userCreation);
		
		let finalResponse = {
			'userId' : userCreation.userId,
			'userName' : userCreation.userName
		};
		return responses.sendResponse(res, constants.messages.createUserSuccess, constants.success, finalResponse);
	 })().catch(function (error) {
		 console.log('error',error);
		return responses.sendError(res, error, constants.failure);
    });
}

let validateUserCreation = request => {

	return new Promise((resolve, reject) => {
		Promise.all([
			userDal.getUserRoles(request),
			userDal.getUserDetails(request)
		]).then((response)=>{
			console.log("response is", response);
			if(request.userRole.toLowerCase() === constants.userRole.superAdmin){
				if(response[0].length >= 1){
					return reject(errorCodes.errorMessages.notMoreSuperAdmin);
				}else{
					return resolve();
				}
			}else if(request.userRole.toLowerCase() === constants.userRole.staff){
				if(response[0].length === 0){
					return reject(errorCodes.errorMessages.cantCreateUser);
				}else if(response[1].length > 0){
					return reject(errorCodes.errorMessages.userAlreadyCreated);
				}else{
					return resolve();
				}
			}else{
				return reject(errorCodes.errorMessages.inValidUserRole);
			}
		}).catch((err)=>{
			return reject(err);
		})
	})
}

exports.loginUser = function(req, res){

	console.log("inside loginUser ::::", req.body);

	let request = {};
		request = req.body;

	Promise.coroutine(function *(){

		if(!request.userName){
			return responses.sendError(res, 'userName is mandatory', constants.failure);
		}
		if(!request.password){
			return responses.sendError(res, 'password is mandatory', constants.failure);
		}

		if(!request.userRole){
			return responses.sendError(res, 'userRole is mandatory', constants.failure);
		}

		let userDetails = yield userDal.getUserDetails(request);
			if(userDetails && userDetails.length){
				if(userDetails[0].password 
					&& crypto.createHmac('sha256', req.body.password).digest('hex') === userDetails[0].password){
						let finalResponse = {};
							finalResponse.userName = userDetails[0].userName;
							finalResponse.email = userDetails[0].officialEmail;
							finalResponse.userId = userDetails[0].userId;
							//finalResponse.jwtToken = jwt.generateToken(userDetails[0].userName);
					return responses.sendResponse(res, constants.messages.loginValid, constants.success, finalResponse);
				}else{
					return responses.sendError(res, constants.messages.loginInvalid, constants.failure);
				}
			}else{
				return responses.sendError(res, constants.messages.loginInvalid, constants.failure);
			}
	 })().catch(function (error) {
    	return responses.sendError(res, error, constants.failure);
    });
}

exports.createCategory = function(req, res){

	let request = {};

		request = req.body;

	Promise.coroutine(function *(){

		yield validator.validateCreateCategoryKeys(request);

		let categoryDetails = yield userDal.getCategory(request);

		if(categoryDetails.length > 0){
			return responses.sendError(res, errorCodes.errorMessages.categoryExist, constants.failure);
		}

		let createCategoryItem = userDal.insertCategoryItem(request);

		return responses.sendResponse(res, constants.messages.success, constants.success, {});

	})().catch(function(err){
		return responses.sendError(res, err, constants.failure);
	});
}

exports.createStaffMembers = function(req, res){

	let request = {};

		request = req.body;

	Promise.coroutine(function *(){

		if(!request.createdBy){
			return responses.sendError(res, 'createdBy is required', constants.failure);
		}

		let userDetails = yield userDal.getAdminDetails(request);

		if(userDetails.length > 0 && userDetails[0].userRole === constants.userRole.superAdmin){

			yield validator.validateStaffList(request);

			let processedList = processRequestArray(request.staffList);

				request.staffList = processedList;

			let createStaffMembers = yield userDal.createStaffMembers(request);

			//send mail notifications
			if(createStaffMembers.insertedRecords && createStaffMembers.insertedRecords.length > 0){
				// let users = _.pluck(createStaffMembers.insertedRecords, 'userName');
				let filteredList = [];
				_.each(createStaffMembers.insertedRecords, insertedObj => {
					_.each(processedList, obj => {
						if(insertedObj.userName === obj.userName){
							obj.approvalLink = config['links'][config.env].approvalLink + obj.code + "&userId=" + obj.userId;
							filteredList.push(obj);
						}
					});
				  
				})
				console.log("filteredList", filteredList);
				remoteApis.sendBulkMail(filteredList, {
					adminEmail: userDetails[0].officialEmail,
					subject: 'Account Creation from Admin',
					commonPwd: constants.commonPwd, 
					template: constants.htmlTemplates.staffCreateTemplate
				});
			}

			return responses.sendResponse(res, constants.messages.success, constants.success, createStaffMembers);
		}else{
			return responses.sendError(res, 'Not a valid superAdmin user', constants.failure);
		}
	})().catch(function(err){
		console.log("error in bulk", err);
		return responses.sendError(res, err, constants.failure);
	});
}

let processRequestArray = function(staffList){

	_.each(staffList, function(obj){
		obj.code = uuidv4();
	});
	return staffList;
}

exports.approveUser = function(req, res){

    Promise.coroutine(function*() {
		
		let request = req.query;
		
            console.log("request for approveUser is",request)
            
            if(!request.code) {
                return res.sendFile(path.join(__dirname + '/approvedErrorMsg.html')); 

            }
            if(!request.userId) {
                return res.sendFile(path.join(__dirname + '/approvedErrorMsg.html'));

            }

            var userDetails = yield userDal.userDataById(request);

			console.log("userDetails is ::::", userDetails);
			
			if(userDetails.length > 0){
				if(!userDetails[0].codeValidity) {
					return res.sendFile(path.join(__dirname + '/alreadyApprovedRejectedMsg.html'))
				}
	
				let updateKeys = {};
				   if(request.code == userDetails[0].code) {
						updateKeys.codeValidity = false;
						updateKeys.approvedDate = new Date();
						updateKeys.status = constants.userStatus.active;
				   }
	
			   request.updateKeys = updateKeys;
	
			   yield userDal.updateUserStatus(request);
	
			   return res.sendFile(path.join(__dirname + '/approvedSuccessMsg.html'))
			}else{
				return res.sendFile(path.join(__dirname + '/alreadyApprovedRejectedMsg.html'))
			}
    })().catch(function (error) {
		console.log("error in catch--->>>>:",error);
	    return responses.sendError(res, error, constants.failure);
	});
}

exports.getAdminCreatedUserList = function(req, res){

	let request = req.query;

	Promise.coroutine(function*() {

		if(!request.userId){
			return responses.sendError(res, 'superAdmin userId is mandatory', constants.failure);
		}

		let adminDetails = yield userDal.userDataById(request);

		if(adminDetails.length > 0){
			if(adminDetails[0].userRole === constants.userRole.superAdmin){
				let userDetails = yield userDal.adminCreatedUsers(request);
				return responses.sendResponse(res, constants.messages.success, constants.success, userDetails);
			}else{
				return responses.sendError(res, 'user is not superAdmin.Please check!!', constants.failure);
			}
		}else{
			return responses.sendError(res, 'user not found', constants.failure);
		}
	})().catch(function(err){
		return responses.sendError(res, err, constants.failure);
	});
}