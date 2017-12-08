const express = require("express");
const app = express();

var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


app.get("/", (req, res) => {
  console.log("1");
  res.end("Hello!");
});

app.get("/about", (req, res) => {
  console.log("2");
  res.render("pages/about");
});

app.get("/urls", (req, res) => {
  var url_objs = urlsForUser(req.cookies.user_ID);

  console.log("3");
  console.log("cookies ",req.cookies);
  let templateVars = { urls: urlDatabase, user: req.cookies.user_ID, url_objs: url_objs };
  console.log("urls of curren user",url_objs);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  console.log("4");
  let templateVars = {user: req.cookies };
  const cookiename = req.cookies["user_ID"];
  if(cookiename) {
    res.render("urls_new", templateVars);
  }
  res.redirect("/urls");

});

//deleting URLs
app.post("/urls/:id/delete", (req, res) => {
  console.log("5");
  var shortURL = req.params.id;
  console.log(shortURL);
  delete urlDatabase[shortURL];
  // console.log(urlDatabase);
  res.redirect("/urls");
});

//updating URLs
app.get("/urls/:id/update", (req, res) => {
  console.log("6");
  var shortURL = req.params.id;

  console.log('short', req.params);
  var longURL = urlDatabase[shortURL].longURL;
  let templateVars = { shortURL: shortURL, longURL:longURL, user: req.cookies.user_ID };
  console.log(templateVars);
  console.log(urlDatabase[shortURL].userID);
  if(templateVars.user === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL]['longURL'] = req.body.longURL;
    console.log("about to show res render");
    res.render("urls_show", templateVars);
    return;
  }
  console.log("about to redirect");
  res.redirect("/urls");
});

//updating URLs
app.post("/urls/:id", (req, res) => {
  console.log("7");
  urlDatabase[req.params.id]['longURL'] = req.body.lURL;
  console.log(req.params.id, req.params.id['longURL'], req.body.lURL)
  res.redirect("/urls");
});

//create new url
app.post("/urls", (req, res) => {
  console.log("8");
  console.log(req.body);  // debug statement to see POST parameters
  var newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);   // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  console.log("9");
  var shortURL = req.params.id;
  //var longURL = urlsForUser(shortURL).longURL;
  let templateVars = { shortURL: shortURL, longURL:longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  console.log("10");
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  console.log("12");
  var shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//get login page
app.get("/login", (req, res) => {
  console.log("hdshfjs");
  let templateVars = {user: req.cookies };
  res.render("login",templateVars);
});

//using cookie for login
app.post("/login", (req, res) => {
  console.log(req.body);
  console.log("13");
  if(req.body.email === '' && req.body.password === '') {
    res.status(403);
    res.send("email and password are required fields");
  }
  let us = false;
  let index;
  for(var i in users) {
     if (users[i].email == req.body.email) {
      us = true;
      index = i;
     }
  }
  if (us == false){
    console.log("not found");
    //continu
    res.status(403).send("email and password does not match");
    return;
  }
  if (!(users[index].password === req.body.password)) {
    console.log("password is not ok");
    return;
  }


  // if(users[i].email !== req.body.email){
  //     if(users[i].password !== req.body.password) {
  //       res.status(400);
  //       res.send("email and password didn't match, please register.");
  //     }
  // }
  console.log(index);
  res.cookie('user_ID', index);
  res.redirect("/urls");
});

//using cookie for logout
app.post("/logout", (req, res) => {
  console.log("14");
  res.clearCookie('user_ID');
  res.redirect('/urls');
});

//registration
app.get("/register", (req, res) => {
  console.log("15");
  let templateVars = { urls: urlDatabase, user: req.cookies};
  res.render("register", templateVars);
});

//create new user
app.post("/register", (req, res) => {
  console.log("17");
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
    password: req.body.password
  };
  console.log(users);
  res.cookie('user_ID', userID);
  res.redirect('/urls');
});

//listening PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function urlsForUser(id) {
  var userUrls = [];
  for(var i in urlDatabase) {
    if(id === urlDatabase[i].userID) {
      userUrls.push(urlDatabase[i]);
    }
  }
//looop through url database
// if the 'id' === the database userid
// add that url to the new object use urls

  return userUrls;
}
