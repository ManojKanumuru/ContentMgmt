'use strict';

var crypto = require('crypto');

var objectId = require('mongodb').ObjectID;

var constants = require('./../generics/constants');

var baseQuery = require('./../../libs/baseQuery');

var async = require('async');

let formCreateUserObj = function(params){

    console.log("inside formCreateUserObj:");

	var userObj = {
		"userName"				: params.userName.toLowerCase() || null,
		"password"				: params.password ? crypto.createHmac('sha256', params.password).digest('hex') : null,
        "firstName"				: params.firstName || null,
		"lastName"				: params.lastName || null,    
        "officialEmail"			: params.officialEmail ? params.officialEmail.toLowerCase() : null,
        "contactPhone"	        : params.contactPhone || null,
        "userRole"              : params.userRole,
        "status"                : constants.userStatus.active,
        "createdBy"				: params.createdBy || null,
		"createdDate"			: new Date()
	}
    return userObj;
}

exports.userCreation = function(params){

    console.log("inside dal:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.requestBody = formCreateUserObj(params);

            baseQuery.insertData(queryObj).then(function(insertedData) {
                let userId = constants.userCode + insertedData.ops[0]._id.toString();
                let updateQueryObj = {};
                    updateQueryObj.condition = {_id : new objectId(insertedData.ops[0]._id)};
                    updateQueryObj.update = {
                        $set : {
                            'userId' : userId
                        }
                    };
                    updateQueryObj.ops = {};
                    updateQueryObj.dbName = 'ContentManagement';
                    updateQueryObj.collectionName = 'users';
                baseQuery.updateData(updateQueryObj).then(function(updatedData) {
                    return resolve(updatedData);
                }).catch(function(error) {
                    return reject(error);
                })
            }).catch(function(err) {
                return reject(err);
            });
    });
}

exports.getUserDetails = function(params){

    console.log("inside dal:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                userName : params.userName.toLowerCase(),
                status : constants.userStatus.active
            };
            if(params.userRole && (params.userRole.toLowerCase() === constants.userRole.superAdmin
                || params.userRole.toLowerCase() === constants.userRole.staff)){
                queryObj.condition.userRole = params.userRole.toLowerCase()
            }
        baseQuery.readData(queryObj).then(function(userData){
            console.log("userData",userData);
            return resolve(userData);
        }).catch(function(error){
            return reject(error);
        });
    })
}

exports.getAdminDetails = function(params){

    console.log("inside dal:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                userId : params.createdBy,
                status : constants.userStatus.active
            };
        baseQuery.readData(queryObj).then(function(userData){
            console.log("userData",userData);
            return resolve(userData);
        }).catch(function(error){
            return reject(error);
        });
    })
}

exports.getUserRoles = function(params){

    console.log("inside getUserRoles:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                userRole : constants.userRole.superAdmin,
                status : constants.userStatus.active
            };
        
        baseQuery.readData(queryObj).then(function(userData){
            console.log("userData",userData);
            return resolve(userData);
        }).catch(function(error){
            return reject(error);
        });
    })
}

let formCategoryObj = function(params){
    
    return {
        "categoryName"	: params.categoryName || null,
		"categoryType"	: params.categoryType || null,
		"createdBy"		: params.createdBy || null,
		"createdDate"	: new Date()
    }
};

exports.insertCategoryItem = function(params){

    return new Promise(function(resolve, reject){

        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'categories';
            queryObj.requestBody = formCategoryObj(params);
        baseQuery.insertData(queryObj).then(function(insertedData){
            if(insertedData.ops && insertedData.ops.length > 0){
                let categoryId = constants.categoryCode + insertedData.ops[0]._id.toString();
                    let updateQueryObj = {};
                        updateQueryObj.condition = {_id : new objectId(insertedData.ops[0]._id)};
                        updateQueryObj.update = {
                            $set : {
                                'categoryId' : categoryId
                            }
                        };
                        updateQueryObj.ops = {};
                        updateQueryObj.dbName = 'ContentManagement';
                        updateQueryObj.collectionName = 'categories'
                    baseQuery.updateData(updateQueryObj).then(function(updatedData) {
                        return resolve(updatedData);
                    }).catch(function(error) {
                        return reject(error);
                    })
            }else{
                return resolve([]);
            }
        }).catch(function(err){
            return reject(err);
        });
    })
}

exports.getCategory = function(params){

    console.log("inside dal:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'categories';
            queryObj.condition = {
                categoryName : params.categoryName
            };
        
        baseQuery.readData(queryObj).then(function(category){
            return resolve(category);
        }).catch(function(error){
            return reject(error);
        });
    })
}

let formStaffObj = function(params, createdBy){

    console.log("inside formStaffObj:", params);

	return {
		"userName"				: params.userName.toLowerCase() || null,
		"password"				: crypto.createHmac('sha256', constants.commonPwd).digest('hex'),
        "officialEmail"			: params.officialEmail ? params.officialEmail.toLowerCase() : null,
        "userRole"              : constants.userRole.staff,
        "status"                : constants.userStatus.pending,
        "createdBy"				: createdBy || null,
        "createdDate"			: new Date(),
        "code"                  : params.code,
		"codeValidity"	        : true
	}
}

exports.createStaffMembers = function(params){

    return new Promise(function(resolve, reject){

        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
        let insertedRecords = [], errorRecords = [];
        async.forEachSeries(params.staffList, function(obj, callback){

            queryObj.condition = {
                'userName': obj.userName,
                'userRole' : constants.userRole.staff,
                $or: [ { status: constants.userStatus.active }, { status: constants.userStatus.pending } ]
            };
                
            baseQuery.readData(queryObj).then(function(userData){
                if(userData.length > 0){
                    errorRecords.push({'userName' : obj.userName, 'err': 'user already created'});
                    callback();
                }else{    
                    queryObj.requestBody = formStaffObj(obj, params.createdBy);
                    baseQuery.insertData(queryObj).then(function(insertedData) {
                        let userId = constants.userCode + insertedData.ops[0]._id.toString();
                        let updateQueryObj = {};
                            updateQueryObj.condition = {_id : new objectId(insertedData.ops[0]._id)};
                            updateQueryObj.update = {
                                $set : {
                                    'userId' : userId
                                }
                            };
                            updateQueryObj.ops = {};
                            updateQueryObj.dbName = 'ContentManagement';
                            updateQueryObj.collectionName = 'users';
                            obj.userId = userId;
                            insertedRecords.push({'userName' : obj.userName, 'userId' : userId});
                        baseQuery.updateData(updateQueryObj).then(function(updatedData) {
                            callback();
                        }).catch(function(error) {
                            callback();
                        })
                    }).catch(function(err) {
                        errorRecords.push({'userName' : obj.userName, 'err': err});
                        callback();
                    });
                }
            }).catch(function(error){
                errorRecords.push({'userName' : obj.userName, 'err': error});
            });
        }, function(data){
            return resolve({'insertedRecords' : insertedRecords, 'errorRecords': errorRecords});
        })
    })
}

exports.userDataById = function(params){
 
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                userId : params.userId
            };
            queryObj.querySelect = {
                '_id': 0,
                'code': 1, 
                'codeValidity': 1, 
                'status': 1, 
                'userRole': 1
                // 'userId': 1,
                // 'officialEmail': 1,
                // 'status': 1
            };
        
        baseQuery.readData(queryObj).then(function(category){
            return resolve(category);
        }).catch(function(error){
            return reject(error);
        });
    })
}

exports.updateUserStatus = function(params){

    console.log("inside updateUserStatus dal:",params);
    
    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                userId : params.userId
            };

            queryObj.update = {
                $set : params.updateKeys
            };
            queryObj.ops = {};
        
        baseQuery.updateData(queryObj).then(function(data){
            return resolve(data);
        }).catch(function(error){
            return reject(error);
        });
    })
}

exports.adminCreatedUsers = function(params){ 

    return new Promise(function(resolve, reject) {
        
        let queryObj = {};
            queryObj.dbName = 'ContentManagement';
            queryObj.collectionName = 'users';
            queryObj.condition = {
                createdBy : params.userId
            };
            if(params.status){
                queryObj.condition.status = params.status;
            }
            queryObj.querySelect = {
                '_id': 0,
                'userId': 1,
                'userRole': 1,
                'status': 1,
                'officialEmail': 1,
                'firstName': 1
            };
        
        baseQuery.readData(queryObj).then(function(category){
            return resolve(category);
        }).catch(function(error){
            return reject(error);
        });
    })      
}