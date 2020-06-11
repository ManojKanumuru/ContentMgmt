'use strict';

let constants = {
	'success'		: 200,
    'failure'		: 201,
    'userCode'      : 'UD_',
    'categoryCode'  : 'CA_',
    'commonPwd'     : 'test',
    'userRole'  : {
        'superAdmin'    : 'superadmin',
        'staff'         : 'staff'
    },
    'userStatus'  : {
        'active'    : 'active',
        'pending'   : 'pending',
        'obselete'  : 'obselete'
    },
    'messages' : {
        'success'               : 'success',
        'loginValid' 			: 'login credentials are valid',
        'loginInvalid' 			: 'Invalid Credentials',
        'createUserSuccess'     : 'User created successfully',
        'noUpdate'              : 'no record to update'
    },

    'htmlTemplates': {
        "staffCreateTemplate" : "<html><head></head><body><p> Hi,</p><p> Your account is created by admin with userName <b>{{userName}}</b> and password <b>{{password}} </b><br/><br/>Kindly Activate using the below link.</p><a href={{approvalLink}}>Click here to activate your account </a><br/></body></html>"
    }
};

module.exports =  constants;