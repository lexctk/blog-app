var express = require ("express");
var app = express();
var bodyParser = require ("body-parser");
var mongoose = require ("mongoose");
var methodOverride = require ("method-override");
var expressSanitizer = require ("express-sanitizer");

var moment = require('moment');
var dateFormat = "dddd, MMMM Do YYYY";

mongoose.connect("mongodb://localhost/blog");
app.use (express.static("public"));
app.use (bodyParser.urlencoded( { extended : true } ));
app.use (methodOverride("_method"));
app.use (expressSanitizer());

app.set("view engine", "ejs");

app.locals.moment = moment;
app.locals.dateFormat = dateFormat;

//mongoose model config
var blogSchema = new  mongoose.Schema ({
    title: String,
    image: String,
    body: String, 
    summary: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model ("Blog", blogSchema);

//ROOT route
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

//INDEX route
app.get("/blogs", function (req, res) {
    
    //get all blogs from the database
    Blog.find({}, function (error, blogs) {
        if (error) {
            console.log(error);
        } else {
            res.render("index", {blogs : blogs});
        }
    });
});

//NEW route
app.get("/blogs/new", function (req, res) {
    res.render("new");
});

//CREATE route
app.post("/blogs", function (req, res) {
    
    //santitize blog content
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    //create blog object 
    var blog = new Blog ({
        title: req.body.blog.title,
        image: req.body.blog.image,
        summary: req.body.blog.summary,
        body: req.body.blog.body
    });
    
    //save it to database
    blog.save( function (error, blog) {
        if (error) {
            console.log(error);
        } else {
            //redirect to blog index
            console.log("Add new blog");
            res.redirect("/blogs");
        }
    });
});

//SHOW route
app.get ("/blogs/:id", function (req, res) {
    //find blog in database
    Blog.findById(req.params.id, function (error, blog) {
        if (error) {
            console.log(error);
        } else {
            //render blog page
            res.render("show", {blog : blog});            
        }
    });
});

//EDIT route
app.get("/blogs/:id/edit", function (req, res) {
    //find blog in database
    Blog.findById(req.params.id, function (error, blog) {
        if (error) {
            console.log(error);
        } else {
            //render edit form
            res.render("edit", {blog : blog});
        }
    });
}); 

//UPDATE route
app.put("/blogs/:id", function (req, res) {
    //santitize blog content
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    //find blog in database
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (error, blog) {
        if (error) {
            console.log(error);
        } else {
            //update database entry
            console.log("Update blog entry " + req.params.id);
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DESTROY route
app.delete("/blogs/:id", function (req, res) {
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(error){
        if (error) {
            console.log("Can't delete!");
            //go back to the blog page
            res.redirect("/blogs/" + req.params.id);
        } else {
            console.log("Delete blog: " + req.params.id);
            //redirect to index
            res.redirect("/blogs");
        }
    });
});

//listen
app.listen (process.env.PORT, process.env.IP, function () {
    console.log("Blog server is listening");
});