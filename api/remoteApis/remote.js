var   request = require("request");
var   Promise = require("bluebird");
var config 	  = require('config');
var remoteConfig =require("./remoteConfig");

exports.sendBulkMail = function(staffList, data) {
	console.log("inside sendBulkMail", JSON.stringify(staffList), data);
	return new Promise(function(resolve, reject) {
		var uri = remoteConfig.completeApiUrls.sendHtmlBulkMail;
		console.log("uri is - ",uri);
		var payload = {
            "staffList" : staffList,
            "data" : data
		};
		
		request({
			uri 	: uri,
			method	: "POST",
			timeout : 15000,
			body   	: payload,
			json    : true
	  }, function(error, response, body) {

		  console.log("body is - ",body);
		  if(error) {
			  console.log("Error in  sending mails", error);
		  } else {
			  console.log("send mails success");
			  if(body.data) {
                console.log("body.data", body.data);
			  } else {
				console.log("not sent");
			  }
		  }
	  });
	})
}