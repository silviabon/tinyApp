var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser');
app.use(cookieParser());


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body["longURL"];
  res.redirect("/urls/" + newShortURL);
});

app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortForm/delete", (req, res) => {
  delete urlDatabase[req.params.shortForm];
  res.redirect("/urls");
});

app.post("/urls/:shortForm/update", (req, res) => {
  urlDatabase[req.params.shortForm] = req.body.newLongURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
 if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("Error: Email and password cannot be empty.");
  }else{
      var valid = false;
    for(var user in users){
      if(users[user].email === req.body.email){
        if(users[user].password === req.body.password){
           valid = true;
           res.cookie('user_id', users[user].id);
            res.redirect("/urls");
        }
      }
    }
    if(!valid){
      res.status(400).send("Invalid Credentials");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("Error: Email and password cannot be empty.");
  }else{
      var ended = false;
    for(var user in users){
      if(users[user].email === req.body.email){
        ended = true;
         res.status(400).send("Error: Email already registered.");
      }
    }
  }
  if(!ended){
  const randomID = generateRandomString();
  users[randomID] = { id: randomID, email: req.body.email, password: req.body.password}
  res.cookie('user_id', randomID);
  res.redirect("/urls");
}
});



function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

