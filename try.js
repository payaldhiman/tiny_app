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
    //password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dchvs"
  }
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

console.log(urlsForUser("user2RandomID"));