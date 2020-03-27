var express= require('express');
var fs= require('fs');
var mongoose= require('mongoose');
var Schema = mongoose.Schema;
var ejs= require('ejs');
var multer= require('multer');
var bodyParser = require('body-parser');
//app.use(express.static("public")); 
var app = express();
app.set('view engine','ejs');
var path   = require('path');
/** Storage Engine */
var storageEngine = multer.diskStorage({
  destination: './files',
  filename: function(req, file, fn){
    fn(null,  new Date().getTime().toString()+'-'+file.fieldname+path.extname(file.originalname));
  }
}); 
//init
var upload =  multer({storage: storageEngine});
// how to make mongo connection?
mongoose.connect('mongodb://localhost:27017/app', { useNewUrlParser: true,  useUnifiedTopology: true });
var photoSchema = new Schema({ 
	path: String,
	title: String,
	category: String,
	caption: String
 });
app.use(bodyParser.urlencoded({ extended:false }));
var Photo = mongoose.model('Photos',photoSchema);
app.use(multer({dest:'./uploads/'}).single('photo'));
app.use(express.static("./"));//middleware for static files, not for ejs files
app.get('/',function(req,res){
	Photo.find({}, ['path','title','category','caption'], {sort:{ _id: -1} }, function(err, photos) {
     if(err) throw err;
     res.render('index.ejs', {photolist : photos }); 
     console.log(photos);  
});	
})

app.get('/upload',function(req,res){
	res.sendFile('dashboard.html', { root : __dirname});
})

app.post('/upload',function(req,res){             
            var fullPath = "uploads/"+req.file.filename;
            var document = {
              path:     fullPath, 
              caption:   req.body.caption,
              category: req.body.category,
              title: req.body.title,
            };
          console.log(fullPath);
          console.log(req.body);
          var photo = new Photo(document); 
          photo.save(function(error){
            if(error){ 
              throw error;
            } 
            res.redirect('/?msg=1');
         });
});          
app.listen(3000, function(){
	console.log("server running");
});

