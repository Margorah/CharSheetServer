# CharSheetServer
Node server of Character Sheet Ionic project

## Quick Start

If you have not, install [MongoDB community edition](https://docs.mongodb.com/manual/administration/install-community/) for your prefered OS and then start it.

Unnecessary, but helpful, is [Robo 3T](https://robomongo.org/) for easy GUI inspection and editing of the local database

Navigate to the server folder in your terminal than run `npm install` to download all the servers dependencies. After it is finished launch the server with `node server.js`.

### API

#### Create User

`POST` request to [localhost:3000/Users]() that expects JSON:

```
{
  "name":      // can be any string of at least a length of 2,
  "email":     // has to be an email string with a min length of 6,
  "password":  // any string with a length of at least 6
}
```

If successful will return a new JSON containing the user: `id, name, and email`. It will also return a Javascript Web Token in the header field `x-auth` that **will be required for most API calls**. This considers the user logged in and currently only expires when the user logs out.

#### Login

`POST` request to [localhost:3000/Users/Me](): Expects the users `email` and `password`. Should be called after a user has been created and logged out for the first time. Returns a new Javascript Web Token and the JSON containing the users `id, name, and email`

#### Logout

`DELETE` request to [localhost:3000/Users/Me](): Deletes the currently stored Web Token and consider the user logged out.

#### Get User's Character List

`GET` request to [localhost:3000/Users/Characters](): Returns an array of JSON containing `_id` and `name` fields for each character they own. **Will later fix `_id` to `id` to maintain consistency with the rest of the API**.

#### Create New Character

`POST` request to [localhost:3000/Users/Characters](): Receives JSON containing just the character's `name` property. Will return the newly created characters id.

#### Get Character

`GET` request to [localhost:3000/Users/Characters/:id](): Where :id represents the `id` of the character you wish. Returns JSON containing the character's `name` and `stats` which is an array of `stat` objects.

#### Add New Character Stat

`POST` request to [localhost:3000/Users/Characters/Stats](): that expects JSON:

```
{
  "id":        // id of the character your adding to,
  "name":      // name of the stat that is a required string with a minimum length of 2
  "value":     // current value of the stat, also required
  "maximum":   // maximum value of the value property which is not required and defaults to 2
  "type":      // required string with a minimum length of 2 defining what type of stat it is
}
```

Will return an array containing all of the stats of the provided character id.

#### Change A Character's Stat

`PATCH` request to [localhost:3000/Users/Characters/Stats](): Expects the exact same JSON structure as *Add New Character Stat*. Will only change the value of a stat whose `name` properties match the object. Returns the provided JSON.

#### Delete A Character's Stat

`DELETE` request to [localhost:3000/Users/Characters/:cid/Stats/:sid](): Where `cid` and `sid` represent the Character's Id and the Stat's Id respectively. Will remove the stat object whose `_id` matchs the provided `sid` property. Returns true.

#### Get All Changes After Timestamp

`GET` request to [localhost:3000/Users/Characters/Stats/:timestamp](): Where `timestamp` represents a UNIX timestamp that the server will query for all changes after it across all user's characters and stats. Returns a JSON array of object where

```
{
  "_id":               // Character Id
  "meta": {            // Object containing changes to non Character attributes since timestamp. Set to 0 if no changes.
      "name":          // Changed name of Character
      "metaUpdated":    // Timestamp of last change to Character's non Stat attributes
  },
  "stats": [           // Array of Character Stats that have changed since provided timestamp
      {
        "_id":          // Stat Id
        "name":         // Stat Name
        "value":        // Current Stat Value
        "updated":      // Timestamp when Stat was last changed
        "statType":     // Stat Type
        "maxValue":     // Stat's max value
      }
  ]
}
```

#### Get Changes of Specific Character After Timestamp

`GET` request to [localhost:3000/Users/Characters/:cid/Stats/:timestamp](): Where `cid` represent the Character's Id and `timestamp` is a UNIX timestamp that the server will query for all stats of the given character that have changed after it. Returns a JSON object of similar structure to the one detailed in *Get All Changes After Timestamp* except for the asbence of the `meta` property.

#### Patch All Characters

`Patch` request to [localhost:3000/Users/Characters](): Expects a JSON Array:

```
[
  {
    "id":              // Character's Id
    "changeType":      // How Character was changed. Described below
    "name":            // Character's Name. Only provided if it has changed since last update
    "updated":         // Unix timestamp documenting when non stat changes were made to the character. Do not provide if none
    "stats": [         
      {
        "id":           // Stat's Id
        "changeType":   // How Stat was changed. Described below
        "name":         // Stat's Name
        "value":        // Stat's current Value
        "maximum":      // Stat's Maximum Value
        "type":         // Stat's Type
        "updated":      // UNIX timestamp representing when the stat was changed
      }
    ]
  }
]
```

The objects in the array describe the changes to characters since the last update. The property `changeType` describes what kind of changes they were. The enum [changeType](server/db/mongo/models/changeTypes.js) informs Mongo if it should add, update, or remove a Character or Stat.

This url should also be used if a User has to add characters to the server after registration. Make sure to remove the `changeType` property from the objects when doing so.

#### Patch Character Stats

`Patch` request to [localhost:3000/Users/Characters/Stats/id](): Expects JSON in the same shape as *Patch All Characters* and operates in the same way.

