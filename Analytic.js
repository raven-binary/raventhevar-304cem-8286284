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

const analyticSchema = new mongoose.Schema
({
    date: {type: String},

    company: {type: String},

    user: {type: String}
});

const Analytic = mongoose.model('Analytic', analyticSchema, 'Analytic');

module.exports = Analytic;