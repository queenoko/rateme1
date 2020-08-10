var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

module.exports = (app) => {

    app.get('/company/create', (req, res) =>{
        res.render('company/company', {title: 'Company Registration', user: req.user});
    });

    //ROUTE FOR UPLOAD
    app.post('/upload', (req, res) => {
        
    })
}