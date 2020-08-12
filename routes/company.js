var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

module.exports = (app) => {

    app.get('/company/create', (req, res) =>{
        res.render('company/company', {title: 'Company Registration', user: req.user});
    });

    //ROUTE FOR UPLOAD
    app.post('/upload', (req, res) => {
        var form = new formidable.IncomingForm(); // incoming form object

        form.uploadDir = path.join(__dirname, '../public/uploads');

        form.on('file', (field, file) => { // to rename a file
            fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
                if(err){
                    throw err
                }

                console.log('File has been renamed');

            });
        });

        form.on('error', (err) => {
            console.log('An error has occured', err);
        });
        form.on('end', () => {
            console.log('File upload was successfull');
        });
        form.parse(req);
    });
}