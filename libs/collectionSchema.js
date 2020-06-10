exports.collectionSchema = {
	"users": {
		"userName"		: {type: String},
		"password"		: {type: String},
        "firstName"		: {type: String},
		"lastName"		: {type: String}, 
        "officialEmail"	: {type: String},
        "contactPhone"	: {type: String},
        "userRole"      : {type: String},
        "status"        : {type: String},
        "createdBy"		: {type: String},
		"createdDate"	: {type: Date},
		"code"			: {type: String},
		"approvedDate"  : {type: Date},
		"codeValidity"	: {type: Boolean}
	},
	"categories": {
		"categoryId" 	: {type: String},
		"categoryName"	: {type: String},
		"categoryType"	: {type: String},
		"createdBy"		: {type: String},
		"createdDate"	: {type: String}
	},
	"products": {

	},
	"productsAudit": {

	},
	"batchRequests": {

	}
}
