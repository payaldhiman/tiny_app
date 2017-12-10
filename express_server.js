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
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashedPassword = bcrypt.hashSync(password, 10);


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
    //user is not logged in
    var url_objs = urlsForUser(req.session.user_id);
    console.log(url_objs);
    let templateVars = { urls: url_objs, user: req.session.user_id};
    res.render("urls_index", templateVars);
  }

});

//create new url
app.post("/urls", (req, res) => {
  console.log("2");
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
  console.log(req.session.user_id);
  console.log(urlDatabase[newShortURL]);


  console.log("After adding new ");
  console.log(urlDatabase);
  let templateVars = { urls: urlDatabase, user: req.session.user_id, display_name: users[req.session.user_id].email};
  res.render("urls_index", templateVars);   // Respond with 'Ok' (we will replace this)
});

//sending to create url to new url page
app.get("/urls/new", (req, res) => {
  console.log("3");

  console.log("i am in the urls/new route");
   const cookiename = req.session.user_id;
   console.log(cookiename);

   //console.log(users[i]);
   if(cookiename) { //user is logged in

    let templateVars = {user: req.session.user_id, display_name: users[req.session.user_id].email};
    res.render('urls_new',templateVars);

   }
   else { //user is not logged in
    res.redirect("/urls");
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
  console.log("5");

  res.render("/urls");
})

//updating URLs
app.get("/urls/:id/update", (req, res) => {
  console.log("6");

  var cookiename = req.session.user_id;
  if(cookiename){ //user is logged in
    var shortURL = req.params.id;
    console.log(req.params.id);
    var longURL = urlDatabase[shortURL].longURL;
    if(cookiename === urlDatabase[shortURL].userID) { //the url belong to the user

      urlDatabase[shortURL]['longURL'] = req.body.longURL;
      console.log("about to show res render");
      let templateVars = { shortURL: shortURL, longURL:longURL, user: req.session.user_id, display_name: users[req.session.user_id].email};
      res.render("urls_show", templateVars);
    } else {
      res.send("The url does not belong to you. You can't edit");
    }

  } else { //user us not logged in
    res.redirect('/login');
  }


});

//
app.get("/urls/:id", (req, res) => {
  console.log("7");
  var shortURL = req.params.id;
  var userId = urlDatabase[shortURL].userID;
  var loggedInUserId = req.session.user_id;
  if(userId === loggedInUserId){
    console.log("user id matches");
  } else {
    console.log("user id does not match");
    res.redirect("/urls");
  }
  var longURL = urlsForUser(shortURL).longURL;
  let templateVars = { shortURL: shortURL, longURL:longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//updating URLs
app.post("/urls/:id", (req, res) => {
  console.log("8");

  urlDatabase[req.params.id]['longURL'] = req.body.lURL;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  console.log("9");
  res.json(urlDatabase);
});

// app.get("/u/:shortURL", (req, res) => {
//   console.log("12");
//   var shortURL = req.params.shortURL;
//   let longURL = urlDatabase[shortURL];
//   res.redirect(longURL);
// });

//get login page
app.get("/login", (req, res) => {
  console.log("10");
  let templateVars = {user: req.session };
  res.render("login",templateVars);
});

//using cookie for login
app.post("/login", (req, res) => {
  console.log("11");

  console.log(req.body);
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
    console.log("not found");
    //continu
    res.status(403).send("email and password does not match");
    return;
  }
  // var hashedPassword = users[userID].password; /// call db by id, then call password;

  if(bcrypt.hashSync(req.body.password, user.password)) {

    req.session.user_id = user.id;
    res.redirect("/urls");

  }
  else {
    return ;
  }



  // if(users[i].email !== req.body.email){
  //     if(users[i].password !== req.body.password) {
  //       res.status(400);
  //       res.send("email and password didn't match, please register.");
  //     }
  // }
  // console.log(index);

});

//using cookie for logout
app.post("/logout", (req, res) => {
  console.log("12");
  req.session = null;
  res.redirect('/urls');
});

//registration
app.get("/register", (req, res) => {
  console.log("13");
  let templateVars = { urls: urlDatabase, user: req.session};
  res.render("register", templateVars);
});

//create new user
app.post("/register", (req, res) => {
  console.log("14");
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

  console.log(users);
  req.session.user_id = userID;
  res.redirect('/urls');
});

//listening PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function urlsForUser(c) {

  for (var uid in urlDatabase) {
    console.log(urlDatabase[uid].userID);
    if (urlDatabase[uid].userID === c) {
      return urlDatabase[uid];
    }
  }
  return null;
}