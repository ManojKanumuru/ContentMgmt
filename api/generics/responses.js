'use strict';

exports.sendResponse = function(res, message, statusCode, data){

	let response = {
        "message": message,
        "status": statusCode,
        "data" : data || {}
    };
    res.send(JSON.stringify(response));
}

exports.sendError = function(res, error, statusCode, data){

	var errMsg = error instanceof Error ? error.message : error;

	let response = {
		'message': errMsg,
		'status': statusCode,
		'data': data || {}
    }
    res.send(JSON.stringify(response));
}