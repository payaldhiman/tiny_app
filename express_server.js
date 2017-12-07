var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  console.log("1");
  res.end("Hello!");
});

app.get("/about", (req, res) => {
  console.log("1");
  res.render("pages/about");
});

app.get("/urls", (req, res) => {
    console.log("2");

  console.log("here");
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    console.log("3");

  res.render("urls_new");
});

app.post("/urls/:id/delete", (req, res) => {
  // console.log("delete here");
  var shortURL = req.params.id;
  console.log(shortURL);
  delete urlDatabase[shortURL];
  // console.log(urlDatabase);
  res.redirect("/urls");
});

app.get("/urls/:id/update", (req, res) => {
  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL];
  let templateVars = { shortURL: shortURL, longURL:longURL };

  res.render("urls_show", templateVars);


});

app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id] = req.body.lURL;
  res.redirect("/urls");


});

app.post("/urls", (req, res) => {
  console.log("5");
  console.log(req.body);  // debug statement to see POST parameters
  var newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);   // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
    console.log("6");

  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL];

  let templateVars = { shortURL: shortURL, longURL:longURL };

  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    console.log("7");

  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
    console.log("8");

  var shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);

}

