//Heroku
var port = process.env.PORT || 8080;

//Dependencies Module Import
const express = require('express');
const app = express();
const axios = require('axios');
const session = require('express-session');

//MongoDB Schemas Import
const Analytic = require('./Analytic');
const User = require('./User');
const UserInfo = require('./UserInfo');

//EJS Setup / View Engine Setup
app.set('view-engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'abcbitmapgger234',
    resave: false,
    saveUninitialized: false,
}));

//EJS Temp Data Storage
const users = [];
const analytic = [];
const book = [];
const deleting = [];
const updateO = [];
const updateC = [];

//////Express

app.get('/', (req,res) => {
    res.render('index.ejs', {name:req.session.whois});
});

app.get('/logout', (req,res) => {
    req.session.whois = null;
    req.session.apikey = null;
    res.redirect('/');
});

//ERROR HANDLINGS

app.get('/error', (req,res) => {
    res.render('lrError.ejs', {name:req.session.whois});
});

app.get('/error2', (req,res) => {
    res.render('dbError.ejs', {name:req.session.whois});
});

app.get('/error3', (req,res) => {
    res.render('lError.ejs', {name:req.session.whois});
});

app.get('/error4', (req,res) => {
    res.render('nError.ejs', {name:req.session.whois});
});

//Functions start from here
app.get('/register', (req,res) => {
    if (req.session.whois != null)
    {
        res.redirect('/error');
    }
    else
    {
        res.render('register.ejs', {name:req.session.whois});
    }
});

app.post('/register', async (req, res) => {
    try 
    {
        users.push({
            name:req.body.name,
            pass:req.body.pass,
            apikey:req.body.apikey
        })

        req.session.whois = req.body.name;
        req.session.apikey = req.body.apikey;

        userinfoValue = new UserInfo ({
        username: req.body.name, 
        password: req.body.pass,
        APIKEY: req.body.apikey
        });
    
        userinfoValue
        .save()

        .then(result=> {
            console.log("Success" + result);
        })

        .catch (error=> {
            console.log("");    
            console.log("Error" + error);
        })

        res.redirect('/login');
    }
    catch 
    {
        res.redirect('/register');
    }
});

app.get('/login', (req,res) => {
    if (req.session.whois != null)
    {
        res.redirect('/error');
    }
    else
    {
        res.render('login.ejs', {name:req.session.whois});
    }
});

app.post('/login', async (req,res) => {
    try
    {
        users.push({
            name:req.body.name,
            pass:req.body.pass,
            apikey:req.body.apikey
        })
        
        UserInfo.findOne({APIKEY: req.body.apikey})
        .then (response => {
            req.session.whois = response.username;
            req.session.apikey = response.APIKEY;

            res.send(req.session.whois + req.session.apikey + res.redirect('/'));

            console.log(response);
        })
        .catch(error => {
            res.send(res.redirect('/error2'));
        });
    }

    catch
    {
        res.redirect('/login');
    }
});

app.get('/search', (req,res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }
    else
    {
        res.render('search.ejs', {name:req.session.whois, companies:req.session.company, date:req.session.date, oprice:req.session.oprice, cprice:req.session.cprice, rate:req.session.rate, opricemyr:req.session.opricemyr, cpricemyr:req.session.cpricemyr});
    }
});

app.post('/search', async (req,res) => {
    
    try
    {
        analytic.push({
            company:req.body.company,
        })

        if (req.body.company == null)
        {
            res.redirect('/error4');
        }

        else
        {
            const companies = req.body.company;

            axios({
                "method":"GET",
                "url":`https://investors-exchange-iex-trading.p.rapidapi.com/stock/${companies}/ohlc`,
                "headers":{
                "content-type":"application/octet-stream",
                "x-rapidapi-host":"investors-exchange-iex-trading.p.rapidapi.com",
                "x-rapidapi-key":"d823eae2a7mshfcaa7dd6af3f470p10435ejsn70df62dea110"
                }
                })
                
                .then((response)=>
                    {
                        var detail = JSON.stringify(response.data);
                        console.log(detail);
        
                        var detail2 = JSON.parse(detail);
                        console.log(detail2);
                    
                        axios({
                            "method":"GET",
                            "url":"https://currency-converter5.p.rapidapi.com/currency/convert",
                            "headers":{
                            "content-type":"application/octet-stream",
                            "x-rapidapi-host":"currency-converter5.p.rapidapi.com",
                            "x-rapidapi-key":"d823eae2a7mshfcaa7dd6af3f470p10435ejsn70df62dea110"
                            },
                            "params":{
                            "format":"json",
                            "from":"USD",
                            "to":"MYR", //Localisation of Currency from USD.
                            "amount": detail2.open.price  // Price from the first API goes here.
                            }
                            })
        
                            .then((response) =>
                            {   
                                var detail3 = JSON.stringify(response.data);
                                console.log(detail3);
                                var detail4 = JSON.parse(detail3);
                                console.log(detail4);
        
                                const ClosePrice = detail2.close.price * detail4.rates.MYR.rate;

                                analyticValue = new Analytic ({
                                    date: detail4.updated_date, 
                                    company: companies,
                                    user: req.session.apikey
                                    });
                                    
                                    analyticValue
                                    .save()
                            
                                    .then(result=> {
                                        console.log("");
                                        console.log("Success" + result);
                                    })
                            
                                    .catch (error=> {
                                        console.log("");    
                                        console.log("Error" + error);
                                    })
                                
                                req.session.company = req.body.company;
                                req.session.date = detail4.updated_date;
                                req.session.oprice = detail2.open.price;
                                req.session.cprice = detail2.close.price;
                                req.session.rate = detail4.rates.MYR.rate;
                                req.session.opricemyr = detail4.rates.MYR.rate_for_amount;
                                req.session.cpricemyr = ClosePrice;

                                res.send(req.session.company + req.session.date + req.session.oprice + req.session.cprice + req.session.rate + req.session.opricemyr + req.session.cpricemyr + res.redirect('/search'));
                                //console.log(response.data);
                            })
            
                            .catch (error=>
                            {
                                console.log("Error" + error);
                            })    
                    })
        }
    }

    catch
    {
        res.redirect('/error4');
        res.status(400).json(error);
    }
});

app.get('/book', (req,res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }
    else
    {
        res.render('book.ejs', {name:req.session.whois});
    }
});

app.post('/book', async (req,res) => {
    
    try
    {
        book.push({
            company:req.body.company,
            open:req.body.open,
            close:req.body.close
        })

        if (req.body.company == null || req.body.open == null || req.body.close == null)
        {
            res.render('/nerror.ejs', {name:req.session.whois});
        }

        else
        {
            const companies = req.body.company;

            axios({
                "method":"GET",
                "url":`https://investors-exchange-iex-trading.p.rapidapi.com/stock/${companies}/ohlc`,
                "headers":{
                "content-type":"application/octet-stream",
                "x-rapidapi-host":"investors-exchange-iex-trading.p.rapidapi.com",
                "x-rapidapi-key":"d823eae2a7mshfcaa7dd6af3f470p10435ejsn70df62dea110"
                }
                })
                
                .then((response)=>
                    {
                        var detail = JSON.stringify(response.data);
                        console.log(detail);
        
                        var detail2 = JSON.parse(detail);
                        console.log(detail2);
                    
                        axios({
                            "method":"GET",
                            "url":"https://currency-converter5.p.rapidapi.com/currency/convert",
                            "headers":{
                            "content-type":"application/octet-stream",
                            "x-rapidapi-host":"currency-converter5.p.rapidapi.com",
                            "x-rapidapi-key":"d823eae2a7mshfcaa7dd6af3f470p10435ejsn70df62dea110"
                            },
                            "params":{
                            "format":"json",
                            "from":"USD",
                            "to":"MYR", //Localisation of Currency from USD.
                            "amount": detail2.open.price  // Price from the first API goes here.
                            }
                            })
        
                            .then((response) =>
                            {   
                                var detail3 = JSON.stringify(response.data);
                                console.log(detail3);
                                var detail4 = JSON.parse(detail3);
                                console.log(detail4);
        
                                const ClosePrice = detail2.close.price * detail4.rates.MYR.rate;
                                 
                                userValue = new User ({
                                    user: req.session.apikey,  
                                    date: detail4.updated_date,  
                                    company: companies,
                                    currency: "MYR",
                                    openprice: detail4.rates.MYR.rate_for_amount,
                                    amountO: req.body.open,
                                    closeprice: ClosePrice,
                                    amountC: req.body.close
                                });
                                    userValue
                                    .save()
                            
                                    .then(result=> {
                                        console.log("");
                                        console.log("Success" + result);
                                    })
                            
                                    .catch (error=> {
                                        console.log("");    
                                        console.log("Error" + error);
                                    })
                                
                                req.session.date2 = detail4.updated_date;
                                req.session.company2 = companies;
                                req.session.currency = "MYR";
                                req.session.openprice2 = detail4.rates.MYR.rate_for_amount;
                                req.session.open2 = req.body.open;
                                req.session.closeprice2 = ClosePrice;
                                req.session.close2 = req.body.close;

                                res.send(req.session.date2 + req.session.company2 + req.session.currency + req.session.openprice2 + req.session.open2 + req.session.closeprice2 + req.session.close2 + res.redirect('/book'));
                                //console.log(response.data);
                            })
            
                            .catch (error=>
                            {
                                console.log("Error" + error);
                            })    
                    })
        }
    }

    catch
    {
        res.redirect('/error4');
        res.status(400).json(error);
    }
});

//More Express     
app.get('https://raventhevar-304cem-8286284.herokuapp.com/view', (req,res) => {
    Analytic.find()
    .then (function(doc) {
        res.render('view.ejs', {name:req.session.whois, items:doc});
        console.log(doc);
    });
});

app.get('/find', (req, res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }

    else
    {
        Analytic.find({user: req.session.apikey})
        .then (function(doc) {
        res.render('find.ejs', {name:req.session.whois, items:doc});
        console.log(doc);
        });
    }
});

app.get('/delete', (req,res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }
    else
    {
        User.find({user: req.session.apikey})
        .then (function(doc) {
        res.render('delete.ejs', {name:req.session.whois, items:doc});
        console.log(doc);
        });
    }
});
 
app.post('/delete', async (req, res) => {
    try
    {
        deleting.push({
            _id:req.body.id,
        })

        User.deleteOne({_id:req.body.id}, 
        function (err) {
            res.redirect('/delete');
        });
    }

    catch
    {
        res.redirect('/error4');
    }
});

app.get('/updateOpen', (req,res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }
    else
    {
        User.find({user: req.session.apikey})
        .then (function(doc) {
        res.render('updateOpen.ejs', {name:req.session.whois, items:doc});
        console.log(doc);
        });
    }
});

app.post('/updateOpen', async (req, res) => {
    try
    {
        updateO.push({
            _id:req.body.id,
            amountO:req.body.amountO
        })

        User.updateOne({_id:req.body.id}, {$set:{amountO: req.body.amountO}}, 
        function (err) {
            res.redirect('/updateOpen');
        });
    }

    catch 
    {
        res.redirect('/error4');
    }
    
});

app.get('/updateClose', (req,res) => {
    if (req.session.whois == null)
    {
        res.redirect('/error3');
    }
    else
    {
        User.find({user: req.session.apikey})
        .then (function(doc) {
        res.render('updateClose.ejs', {name:req.session.whois, items:doc});
        console.log(doc);
        });
    }
});

app.post('/updateClose', async (req, res) => {
    try
    {
        updateO.push({
            _id:req.body.id,
            amountC:req.body.amountC
        })

        User.updateOne({_id:req.body.id}, {$set:{amountC: req.body.amountC}}, 
        function (err) {
            res.redirect('/updateClose');
        });
    }

    catch 
    {
        res.redirect('/error4');
    }
    
});

app.listen(port,function() {
    console.log("app running on port 8080"); 
});