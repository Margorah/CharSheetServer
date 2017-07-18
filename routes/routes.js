const url = require('url');
const db = require('./../db/mongo.js');

module.exports = routes = (request, response, serverCall) => {

    var params = url.parse(request.url).pathname.slice(1).split('/');
    
    switch (params[0]) {
        case 'Users':
            //Trying to Log In
            console.log('Reached Users If');
            if (request.method == 'GET') {
                var queryJSON = url.parse(request.url, true).query
//                retrieveData(request, serverCall, (errorString, JSONdata) => {
                db.retrieve(queryJSON, params[0], (error, result) => {
                    serverCall(error, result);
                });
                //});
            }
            else if (request.method == 'POST') {
                console.log('Reached Post');
                retrieveData(request, serverCall, (errorString, JSONdata) => {
                    db.create(JSONdata, params[0], (error, result) => {
                        serverCall(error, result);
                    });
                });
            } else {
                serverCall(errMsg.BADDATASTRING);
            }
            // IMPLEMENT PATCH?
        break;

        case 'Characters':
            //Targeting a specific character
            if (params[1]) {
                //retrieving a specific character
                if (request.method == 'GET') {
                    serverCall(undefined, 'character: ' + params[1]);
                }
                //adding a new character
                else if (request.method == 'POST') {
                    retrieveData(request, (JSONdata) => {
                        serverCall(undefined, JSONdata);
                    });
                // REMOVE CHARACTER
                } else if (request.method == 'DELETE') {
                    retrieveData(request, (JSONdata) => {
                        serverCall(undefined, JSONdata);
                    });
                // RENAME CHARACTER
                } else if (request.method == 'PATCH') {
                    retrieveData(request, (JSONdata) => {
                        serverCall(undefined, JSONdata);
                    });
                }
                // TODO: Implement Patch ??
            } else {
            //Get user character list or return bad url
                if (request.method == 'GET') {
                    serverCall(undefined, 'characters');
                } 
                else
                    serverCall(errMsg.BADURLSTRING);
            }
        break;

        case 'Stats':
            // GET ALL STATS OF SPECIFIC CHAR
            if (params[1]) {

            } else {

                if (request.method == 'GET') {
                    serverCall(undefined, 'stat');
                } else
                    serverCall(errMsg.BADURLSTRING);
            }
        break;

        default:
            serverCall(errMsg.BADURLSTRING);
    }
};

retrieveData = (request, serverReturn, callback) => {
    var postData = '';
    request.on('data', (part) => {
        postData += part.toString();
    });
    request.on('end', () => {
        postData = tryParseJSON(postData);
        if (postData === false)
            return serverReturn(errMsg.BADJSONERRORSTRING, undefined);
        return callback(undefined, postData);
    });
};

tryParseJSON = (jsonString) => {
    try {
        var o = JSON.parse(jsonString);

        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
};