const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
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
}  


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/login', (req,res) => {
  const user = req.cookies['user_id'];
  if (user) {
    return res.redirect('/urls')
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  }
  res.render('login', templateVars);
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = exsistingUserByEmail(email);
  if(!user) {
    return res.status(403).send('Status code 403. This email address is not registered');
  }
  if (user.password !== password) {
    return res.status(403).send('Status code 403. Your password does not match');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const user = req.cookies['user_id']
  if (user) {
    return res.redirect('/urls')
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  }
  res.render('register', templateVars);
})

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Status Code: 400. Do not leave password or email blank.');
  }
  if (exsistingUserByEmail(email)) {
      return res.status(400).send('Status Code: 400. This email address is already in use.');
  }
  users[userId] = {
    id: userId,
    email,
    password
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
})

app.get('/hello', (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const user = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    user: users[user]
  }
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const user = req.cookies['user_id']
  if (!user) {
    return res.status(403).send('Status code 403, You cannot add a new url without being logged in')
  }
  console.log(req.body); 
  longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/new", (req, res) => {
  const user = req.cookies['user_id']
  if (!user) {
    return res.redirect('/login')
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  }
  res.render("urls_new", templateVars);
});

// Redirects user to the corresponding long url, aka the key functionality of our website
app.get('/u/:shortURL', (req, res) => {
  console.log(res.statusCode);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[user] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const newUrl = req.body.newURL;
  const shortURL = req.body.shortURL;
  urlDatabase[shortURL] = newUrl;
  res.redirect('/urls');
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.body.delete];
  res.redirect('/urls')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// generates a random string for ID purposes
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result.trim();
}

// takes in an email and if there is a user with that email, returns that user.
function exsistingUserByEmail(email) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
}

