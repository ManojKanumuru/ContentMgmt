'use strict';

var globalVar = require('./../api/commons/globalVar');

const constants = require("./../api/generics/constants");

exports.insertData = function (obj) {
	console.log("obj is in insertData ---- ", obj);
	return new Promise (function(resolve, reject) {
        var cmsDB = globalVar.cmsDB();
        var db = cmsDB.db(obj.dbName);
        db.collection(obj.collectionName).insertOne(obj.requestBody, function(err,data){
            if (err) {
                return reject(err);
            } else {
                console.log("create success ::::");
                return resolve(data);
            }
        });
    })
}

exports.readData = function (obj) {
	
    console.log("inside readData baseQuery:",obj);
    return new Promise (function(resolve, reject) {
        var cmsDB = globalVar.cmsDB();
        var db = cmsDB.db(obj.dbName);
        var cursor = db.collection(obj.collectionName).find(obj.condition);
        if(obj.querySelect) {
            cursor = cursor.project(obj.querySelect);
        }
        cursor.toArray(function(err,data){
            if (err) {
                return reject(err);
            } else {
                return resolve(data);
            }
        });
    })
}

exports.updateData = function (obj) {
    
    console.log("obj is in updateData ---- ",JSON.stringify(obj));
    
    return new Promise (function(resolve, reject) {
        var cmsDB = globalVar.cmsDB();
        var db = cmsDB.db(obj.dbName);
        db.collection(obj.collectionName).updateOne(obj.condition, obj.update, obj.ops, function(err,data){
            if (err) {
                return reject(err);
            } else {
                console.log("result after update is :::::"+JSON.stringify(data));
                if(data.result && data.result.n && data.result.n === 1){
                    console.log("result after update check is :::::");
                    var cursor = db.collection(obj.collectionName).find(obj.condition);
                    cursor.toArray(function(err, updatedData){
                        if (err) {
                            return reject(err);
                        } else {
                            if(updatedData.length){
                                updatedData = updatedData[0];
                            }
                            return resolve(updatedData);
                        }
                    });
                }else{
                    return resolve({message : constants.noUpdate});
                }
            }
        });
    })
};

exports.removeData = function (obj) {
   
  console.log("obj is in removeData");
  
  return new Promise (function(resolve, reject) {
    var cmsDB = globalVar.cmsDB();
    var db = cmsDB.db(obj.dbName);
    if((obj.condition.hasOwnProperty('taskId') && obj.condition.taskId) ||
        (obj.condition.hasOwnProperty('userName') && obj.condition.userName)){
        db.collection(obj.collectionName).deleteOne(obj.condition, function(err, data){
            if (err) {
                return reject(err);
            } else {
                console.log("delete data success ---- ", data.result);
                if(data.result && data.result.n && data.result.n === 1){
                    console.log("inside if delete check ::::");
                    return resolve({message : 'delete success'});
                }else{
                    console.log("inside else delete check ::::");
                    return resolve({message : 'no task to delete'});
                }
            }
        })
    }else{
        return reject('cannot delete record');
    }
  });
};