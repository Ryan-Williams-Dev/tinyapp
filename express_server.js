const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs')
const { generateRandomString, urlsByUserID, exsistingUserByEmail } = require('./helpers/helpers')
const { urlDatabase, users } = require('./data/DBs')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const user = req.cookies['user_id'];
  if (user) return res.redirect('/urls')
  return res.redirect('/login')
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
  const {email, password} = req.body;
  const user = exsistingUserByEmail(email, users);
  if(!user) {
    return res.status(403).send('Status code 403. This email address is not registered');
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Status code 403. Your password does not match');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Status Code: 400. Do not leave password or email blank.');
  }
  if (exsistingUserByEmail(email, users)) {
      return res.status(400).send('Status Code: 400. This email address is already in use.');
  }
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
})

app.get('/urls', (req, res) => {
  const user = req.cookies['user_id']
  if (!user) {
    return res.status(403).send("403: You need to be logged in to see a list of urls");
  }
  urls = urlsByUserID(users[user].id, urlDatabase)
  const templateVars = {
    urls,
    user: users[user]
  }
  res.render('urls_index', templateVars);
});

// this is to add a new url, POST route
app.post("/urls", (req, res) => {
  const user = req.cookies['user_id']
  if (!user) {
    return res.status(403).send('Status code 403, You cannot add a new url without being logged in')
  }
  console.log(req.body); 
  longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL,
    longURL,
    userID: user
  };
  res.redirect(`/urls`);
});


app.get("/urls/new", (req, res) => {
  const user = req.cookies['user_id']
  if (!user) {
    return res.status(403).send('403: You need to be logged in to create a new short link url')
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  }
  res.render("urls_new", templateVars);
});

// Redirects user to the corresponding long url, aka the key functionality of our website
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send('Status code 403, This url does not exist');
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
})

app.get("/urls/:shortURL", (req, res) => {
  const user = req.cookies['user_id'];
  if (!user) {
    return res.redirect('/login');
  }
  urls = urlsByUserID(users[user].id, urlDatabase)
  if (urls[req.params.shortURL] == undefined) {
    return res.status(403).send("403: this url does not belong to you");
  }
  const templateVars = {
    shortURL: urls[req.params.shortURL].shortURL,
    longURL: urls[req.params.shortURL].longURL,
    user: users[user] 
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const user = req.cookies['user_id'];
  const newUrl = req.body.newURL;
  const shortURL = req.body.shortURL;
  if (!user || user !== urlDatabase[shortURL].userID) {
    return res.status(403).send('403: You do not have permission to change this url');
  }
  urlDatabase[shortURL].longURL = newUrl;
  res.redirect('/urls');
})

app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]) {
    return res.status(403).send('403: This url does not exist');
  }
  if (urlDatabase[shortURL].userID === user) {
    delete urlDatabase[req.body.delete];
    return res.redirect('/urls')
  }
  return res.status(403).send('403: You do not have permission to delete this url')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
