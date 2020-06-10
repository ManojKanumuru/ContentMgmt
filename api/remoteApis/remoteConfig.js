var apiRoutes = { 
	"sendHtmlBulkMail"   	: "/api/util/sendHtmlBulkMail"
}

var staticUrls = {
	"utilService"		: "http://localhost:3001"
}

var dynamicUrls = {
	"utilService" 	    : ""
}

exports.completeApiUrls = {
   	"sendHtmlBulkMail" 	    :	(dynamicUrls.utilService || staticUrls.utilService) +  apiRoutes.sendHtmlBulkMail
}