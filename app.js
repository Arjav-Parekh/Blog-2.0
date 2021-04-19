//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https");

const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
var _ = require("lodash");
const { getMaxListeners } = require('process');

mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const newPostSchema = new mongoose.Schema({
  title: String,
  body: String,
  img: String
})

const newUserSchema = new mongoose.Schema({
  email: String,
  password: String
})



newUserSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]});

// 
const Post = mongoose.model("Post", newPostSchema);
const User = mongoose.model("User", newUserSchema);

const posts = [];



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));




app.get("/login",function(req,res){
  userAuthor=0;
  count=0;
  res.render("login")
})
app.get("/signup",function(req,res){
  userAuthor=0;
  count=0;
  res.render("signup")
})


app.post("/signup",function(req,res){

if(req.body.repassword==req.body.password){
  const user = new User({
    email: req.body.username,
    password: req.body.password
  })
  user.save(function(err) {
    if (!err) {
      console.log("New User added")
      Post.find({}, function(err, posts) {
        count=1
        res.render("home", {
    
          posts: posts
    
        });
    
      })
    }
  })
}

})

count=0

app.post("/signin",function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username},function(err,foundOne){
    if(err){
      console.log("err")
    }else{
      if(foundOne){
        if(foundOne.password===password){
          count=1
          Post.find({}, function(err, posts) {

            res.render("home", {
        
              posts: posts
        
            });
        
          })
        }
      }
    }
  })
  User.findOne({email: "arjavparekh@gmail.com"},function(err,foundOne){
    if(err){
      console.log("err")
    }else{
      if(foundOne){
        if(foundOne.password===password){
          userAuthor=998;

        }
      }
    }
  })
})



app.get("/posts/:postId", function(req, res) {
  var requestedPostId = req.params.postId;
  
    Post.find({}, function(err, posts) {
      Post.findOne({
        _id: requestedPostId
      }, function(err, post) {
    
        res.render("post", {
    
          title: post.title,
    
          body: post.body,
    
          imgBlog: post.img,
    
          posts:posts
    
    
        });


    
    })

  });
  

})
app.get("/posts/:postId", function(req, res) {


  

})


app.get("/", function(req, res) {
  if(count>0){

      Post.find({}, function(err, posts) {
    
        res.render("home", {
    
          posts: posts
    
        });
    
      })
  }else{
    res.redirect("/login");
    console.log("error");
  }
  
  
})

app.get("/about", function(req, res) {
  if(count>0){
    res.render("about");
  }else{
    res.redirect("/login");
    console.log("error");
  };

});

app.get("/contact", function(req, res) {
  if(count>0){
    res.render("contact");
  }else{
    res.redirect("/login")
    console.log("error")
  };
});


app.post("/contact", function(req, res) {
  var firstName= req.body.firstname;
  var lastName= req.body.lastname;
  var emailId= req.body.emailid;
  var subject= req.body.subject;

  var data = {
    members:[
      {
        email_address: emailId,
        status: "subscribed",
        merge_fields:{
          FNAME: firstName,
          LNAME: lastName,
          SUBJECT: subject
        }
      }
    ]
  }
  const jsonData = JSON.stringify(data);

  const url = "https://us10.api.mailchimp.com/3.0/lists/3a5c6d6323"

  const options = {
    method:"POST",
    auth: "kronos:eb69a20e497b76bc6110a9e32a7a78f7-us10"
  }

  const request = https.request(url,options, function(response){



      response.on("data",function(data){
        var y= JSON.parse(data);
      if( y.error_count===0){
          // res.render("success")
          console.log("success")
          res.redirect("/")
      }else{
          // res.render("failure")
          console.log("failure")
        }
      console.log(y);
    })
  })

  request.write(jsonData);
  request.end()
})

var news_title=[];
var news_desc=[];
var news_image=[];
var news_link=[];

const url = "https://gnews.io/api/v3/search?q=example&token=a6150f4f2b0cc609bd21eeb54f38df5b"
https.get(url, function(response) {
  // console.log(response)
      response.on('data', function(data) {
        const newsData = JSON.parse(data);
        for(i=0;i<5;i++){

         news_title.push(newsData.articles[i].title);
         news_image.push(newsData.articles[i].image);
         news_desc.push(newsData.articles[i].description);
         news_link.push(newsData.articles[i].url)

        }



app.get("/news", function(req, res) {
  if(count>0){
    res.render("news",{
      new_titles:news_title,
      new_descs:news_desc,
      new_image:news_image,
      new_link:news_link
    });     
  }else{
    res.redirect("/login");
    console.log("error");
  };
       
});


app.get("/compose", function(req, res) {
  if(userAuthor==998){
    res.render("compose",{
      buttontext:"Post",
      buttonval:"0"
    })
  }else{
    res.render("compose",{
      buttontext:"Only Authors can post.",
      buttonval:"1"
    
    })
  }
})

app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.newTitle,
    body: req.body.bodyBlog,
    img: req.body.imgBlog

  })
  post.save(function(err) {
    if (!err) {
      res.redirect("/")
    }
  })

})



app.post("/news", function(req, res) {

              res.render("news",{
                new_titles:news_title,
                new_descs:news_desc,
                new_image:news_image,
                new_link:news_link
              });            
            });
          })
        })

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


