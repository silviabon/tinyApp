var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
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
  console.log(`Tiny app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect("/login");
  }else{
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  if(req.session.user_id === undefined){
    filteredUrlDatabase = {};
    let templateVars = { user: users[req.session.user_id], urls: filteredUrlDatabase };
    res.render("urls_index", templateVars);
  }else{
    let filteredUrlDatabase = {};
    for(var url in urlDatabase){
      if(urlDatabase[url].userID === req.session.user_id){
        filteredUrlDatabase[url] = urlDatabase[url];
      }
    }
    let templateVars = { user: users[req.session.user_id], urls: filteredUrlDatabase };
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  if(req.session.user_id === undefined){
    res.status(403).send("Access denied. Please login.");
  } else if(req.session.user_id === urlDatabase[req.params.id].userID){
    let templateVars = { user: users[req.session.user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    res.render("urls_show", templateVars);
  }else{
    res.status(403).send("Access denied. You can only access URLs you created.");
  }
});


app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {longURL: req.body["longURL"], userID: req.session.user_id};
  res.redirect("/urls/" + newShortURL);
});

app.post("/urls/:shortForm/delete", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortForm].userID){
    delete urlDatabase[req.params.shortForm];
    res.redirect("/urls");
  }else{
    res.status(400).send("Error: You can only delete URLs you created.");
  }
});

app.post("/urls/:shortForm/update", (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortForm].userID){
  urlDatabase[req.params.shortForm] = {longURL: req.body.newLongURL, userID: req.session.user_id};
  res.redirect("/urls");
}else{
    res.status(400).send("Error: You can only update URLs you created.");
  }
});


app.post("/login", (req, res) => {
 if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("Error: Email and password cannot be empty.");
  }else{
    var valid = false;
    for(var user in users){
      if(users[user].email === req.body.email){
        valid = bcrypt.compareSync(req.body.password, users[user].password);
        if(valid){
          req.session.user_id = users[user].id;
          res.redirect("/urls");
        }else{
          res.status(400).send("Invalid Credentials");
        }
      }
    }
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
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
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[randomID] = { id: randomID, email: req.body.email, password: hashedPassword}
    req.session.user_id = randomID;
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