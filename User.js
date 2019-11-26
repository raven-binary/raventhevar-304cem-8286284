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

const userSchema = new mongoose.Schema
({
    user: {type: String},
    
    date: {type: String},

    company: {type: String},

    currency: {type: String},

    openprice: {type: String},

    amountO: {type: Number},

    closeprice: {type: String},

    amountC: {type: Number}
});

const User = mongoose.model('User', userSchema, 'User');

module.exports = User;