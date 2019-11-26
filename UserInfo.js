const mongoose = require('mongoose');

const db = "mongodb+srv://RavenThevar:password12345678@databaservn-kkxhm.mongodb.net/StockExchange?retryWrites=true&w=majority";

mongoose
.connect(db)

.then(()=> {
console.log("Connected to database");
})

.catch(()=> {
console.log("Error Connected to database");
})

const userinfoSchema = new mongoose.Schema
({
    username: {type: String},

    password: {type: String},

    APIKEY: {type: String}
});

const UserInfo = mongoose.model('UserInfo', userinfoSchema, 'UserInfo');

module.exports = UserInfo;