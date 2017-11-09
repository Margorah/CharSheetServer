const CHANGETYPES = require('../models/changeTypes');

function buildChars(chars, userId) {
    let arrayToReturn = [];
    for (let char of chars) {
        let currObj;
        switch (char.changeType) {
            case CHANGETYPES.UPDATE:
                currObj = buildUpdateWithStats(char, userId, char.id);
                arrayToReturn = arrayToReturn.concat(currObj);
                break;
            case CHANGETYPES.DELETE:
                currObj = { deleteOne: { 'filter': { 'owner': userId, '_id': char.id } } };
                arrayToReturn.push(currObj);
                break;
            case CHANGETYPES.ADD:
            default:
                currObj = {
                    insertOne: {
                        "document": {
                            '_id': char.id,
                            'owner': userId,
                            'name': char.name,
                            'metaUpdated': char.updated
                        }
                    }
                };
                if (char.stats !== undefined) {
                    let stats = buildStats(char.stats);
                    currObj.insertOne.document['stats'] = stats;
                }
                arrayToReturn.push(currObj);
                break;
        }
    }
    return arrayToReturn;
}

function filterActions(stat, oldObj) {
    let newAction;
    switch (stat.changeType) {
        case CHANGETYPES.UPDATE:
            if (oldObj['$set'] !== undefined) {
                // wierd recursiveness I do not like
                newAction = oldObj;
                newAction['$set']['stats.$'] = buildStat(stat);
            } else {
                newAction = {
                    '$set': {
                        'stats.$': buildStat(stat)
                    }
                };
            }
            break;
        case CHANGETYPES.DELETE:
            newAction = {
                '$pull': {
                    'stats': {
                        '_id': stat.id
                    }
                }
            };
            break;
        case CHANGETYPES.ADD:
            // default:
            newAction = {
                '$push': {
                    'stats': buildStat(stat)
                }
            };
            break;
    }
    return newAction;
}

// Change server stats to have same member names as client?
function buildStat(stat) {
    return {
        '_id': stat.id,
        'name': stat.name,
        'value': stat.value,
        'maxValue': stat.maximum,
        'statType': stat.type,
        'updated': stat.updated,
    };
}

function buildStats(stats) {
    let statObj = [];
    for (let stat of stats) {
        let newStat = buildStat(stat);
        statObj.push(newStat);
    }
    return statObj;
}

function buildUpdateWithStats(char, userId, charId) {
    let returnArray = [];
    let statsArray;
    let updateObj = {};
    let filterObj = {
        'owner': userId,
        '_id': charId
    };
    let currObj = {
        updateOne: {
            'filter': filterObj,
            'update': updateObj
        }
    };

    if (char.name !== undefined) {
        updateObj['$set'] = {};
        updateObj['$set']['name'] = char.name;
        updateObj['$set']['metaUpdated'] = char.updated;
    }

    if (char.stats !== undefined) {

        // If only one stat has changed roll it in with the change to name, if it exists,

        if (char.stats[0].changeType === CHANGETYPES.UPDATE) {
            filterObj['stats._id'] = char.stats[0].id;
        }
        updateObj = filterActions(char.stats[0], updateObj);

        // Each subsequent stat change has to be in it's own object because of the potential conflict of editing the same array and mongo's parallel system. I think

        if (char.stats.length > 1) {
            statsArray = [];
            for (let i = 1; i < char.stats.length; i++) {
                let actionObj = filterActions(char.stats[i]);
                let buildObj = { updateOne: { filter: { owner: userId, '_id': charId }, update: actionObj } };
                if (char.stats[i].changeType === CHANGETYPES.UPDATE) {
                    buildObj.updateOne.filter['stats._id'] = char.stats[i].id;
                }
                statsArray.push(buildObj);
            }
        }
    }
    returnArray.push(currObj);
    if (statsArray !== undefined) {
        return returnArray.concat(statsArray);
    } else {
        return returnArray;
    }
}

module.exports = {
    buildChars: buildChars,
    filterActions: filterActions,
    buildStat: buildStat,
    buildStats: buildStats,
    buildUpdateWithStats: buildUpdateWithStats
};