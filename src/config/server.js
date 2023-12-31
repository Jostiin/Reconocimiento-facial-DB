const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const multer = require('multer')

const app = express();


const storage = multer.diskStorage({
    destination:path.join(__dirname,'../app/upload'),
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

//settings

app.use(express.static(path.join(__dirname,'../app')));
app.use('/css',express.static(__dirname +'../app/css'));
app.use('/js',express.static(__dirname +'../app/js'));
app.use('/models',express.static(__dirname +'../app/models'));
app.use('/labeled_images',express.static(__dirname +'../app/labeled_images'));
app.use('/upload',express.static(__dirname +'../app/upload'));



app.set('port',process.env.PORT || 8080);


app.set('view engine','ejs');

app.set('views',path.join(__dirname,'../app/views'));




// parser
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: false}));
app.use(multer({
    storage:storage,
    dest:path.join(__dirname,'../app/upload')
}).fields([{name:"image1",maxCount:1},{name:"image2",maxCount:1}]));
module.exports = app;