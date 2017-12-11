const express = require("express");
const app = express();

var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET_KEY || "some secret key"]
}));

app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

// ************* objects(DBs) declared ****** //
let urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    //password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    password: bcrypt.hashSync("123", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

// ******* Middleware functions *********** //

// "/" get
app.get("/", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename) {
    //user is logged in
    res.redirect("/urls");
  } else {
    //user not logged in
    res.redirect("/login");
  }

});

// home page
app.get("/urls", (req, res) => {
  //if the user logged in or not
  console.log("1");
  const cookiename = req.session.user_id;
  if(cookiename){ //user is logged in
    let templateVars = { urls: urlDatabase, user: req.session.user_id, display_name: users[req.session.user_id].email};
    console.log(templateVars);
    res.render("urls_index", templateVars);
  } else {
    res.send("ERROR: User needs to Login or Register.");
  }
});

//get login page
app.get("/login", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename){ //user is logged in
    res.redirect("/urls");
  } else {
    let templateVars = {user: req.session };
    res.render("login",templateVars);
  }
});

//registration page
app.get("/register", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename){ //user is logged in
    res.redirect("/urls");
  } else {
    let templateVars = { urls: urlDatabase, user: req.session};
    res.render("register", templateVars);
  }
});

//set cookie and login
app.post("/login", (req, res) => {
  if(req.body.email === '' && req.body.password === '') {
    res.status(403);
    res.send("email and password are required fields");
  }
  let us = false;
  let user;
  for(var i in users) {
     if (users[i].email == req.body.email) {
      us = true;
      user = users[i];
     }
  }
  if (us == false){
    res.status(403).send("email and password does not match");
    return;
  }
  if(bcrypt.hashSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
  else {
    return ;
  }
});

//register new user and set cookie
app.post("/register", (req, res) => {
  var userID = generateRandomString();
  if(req.body.email === '' && req.body.password === '') {
    res.status(400);
    res.send("email and password are required fields");
  }
  for(var i in users) {
    if(users[i].email === req.body.email) {
      res.status(400);
      res.send("email already exists, please login.");
    }
  }
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password,10)
  };
  req.session.user_id = userID;
  res.redirect('/urls');
});

//using cookie for logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//sending to create url to new url page
app.get("/urls/new", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename) { //user is logged in
    let templateVars = {user: req.session.user_id, display_name: users[req.session.user_id].email};
    res.render('urls_new',templateVars);
  } else { //user is not logged in
    res.redirect("/login");
  }
});

//create new url
app.post("/urls", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename) {
    if(req.body.longURL === "") {
      res.status(400);
      res.send("enter URL or go back to homepage.");
    }
    var newShortURL = generateRandomString();
    var newObject = {
      shortURL: newShortURL,
      longURL: req.body.longURL,
      userID: req.session.user_id
    }
    urlDatabase[newShortURL] = newObject;
    let templateVars = { urls: urlDatabase, user: req.session.user_id, display_name: users[req.session.user_id].email};
    res.render("urls_index", templateVars);
  } else {
    res.send("ERROR: User needs to Login or Register.");
  }
});

//updating URLs
app.post("/urls/:id", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename) {
    urlDatabase[req.params.id]['longURL'] = req.body.lURL;
    res.redirect("/urls");
  } else {
    res.send("ERROR: User needs to Login or Register.");
  }
});

//deleting URLs
app.post("/urls/:id/delete", (req, res) => {
  console.log("4");
  var shortURL = req.params.id;
  console.log(shortURL);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//
app.get("/urls/:id/delete", (req, res) => {
  res.render("/urls");
})

//an edit button which makes a GET request to /urls/:id
app.get("/urls/:id", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename) { //user is logged in
    let templateVars = { urls: urlDatabase, longURL: urlDatabase[req.params.id]['longURL'], shortURL: req.params.id, user: req.session.user_id, display_name: users[req.session.user_id].email };
    res.render("urls_show", templateVars);
  } else { //user is not logged in
    res.send("ERROR: User needs to Login or Register. Go to ");
  }
});

//updating URLs
app.get("/urls/:id/update", (req, res) => {
  const cookiename = req.session.user_id;
  if(cookiename){ //user is logged in
    var shortURL = req.params.id;
    console.log(req.params.id);
    var longURL = urlDatabase[shortURL].longURL;
    if(cookiename === urlDatabase[shortURL].userID) { //the url belong to the user
      urlDatabase[shortURL]['longURL'] = req.body.longURL;
      let templateVars = { shortURL: shortURL, longURL:longURL, user: req.session.user_id, display_name: users[req.session.user_id].email};
      res.render("urls_show", templateVars);
    } else {
      res.send("The url does not belong to you. You can't edit");
    }
  } else { //user us not logged in
    res.redirect('/login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const cookiename = req.session.user_id;
  for(var url in urlDatabase) {
    if(urlDatabase[url].userID === cookiename) {
      var shortURL = req.params.shortURL;
      let longURL = urlDatabase[shortURL].longURL;
      console.log(longURL);
      res.redirect(longURL);
    } else {
      res.send("");
    }
  }
});

app.get("/urls.json", (req, res) => {
  console.log("9");
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function urlsForUser(c) {
  let usersUrl = {};
  for (var uid in urlDatabase) {
    console.log(urlDatabase[uid].userID);
    if (urlDatabase[uid].userID === c) {
      usersUrl += urlDatabase[uid];
      console.log(usersUrl);
    }
  }
  return null;
}