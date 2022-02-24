const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, urlsByUserID, getUserByEmail } = require('./helpers/helpers');
const { urlDatabase, users } = require('./data/DBs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['userID'],
}));

app.set('view engine', 'ejs');

// Default '/' route driects to either the urls page, or the log in page. depending on if the client is logged in or not
app.get('/', (req, res) => {
  const user = req.session['userID'];
  if (user) {
    return res.redirect('/urls');
  }
  return res.redirect('/login');
});

// Route to the login page
app.get('/login', (req,res) => {
  const user = req.session['userID'];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  };
  res.render('login', templateVars);
});

// Post route for the login form. authenticates user and innitiates a new session cookie if email and password hash match existing user.
app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send('Status code 403. This email address is not registered');
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Status code 403. Your password does not match');
  }
  req.session['userID'] = user.id;
  res.redirect('/urls');
});

// Post route for logging out.
app.post('/logout', (req, res) => {
  req.session['userID'] = null;
  res.redirect('/');
});

// route to render the register user page & form
app.get('/register', (req, res) => {
  const user = req.session['userID'];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  };
  res.render('register', templateVars);
});

// this route checks the imput from the register form and creates a new user in the database with a generated ID, and if successful, logs the user in.
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Status Code: 400. Do not leave password or email blank.');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send('Status Code: 400. This email address is already in use.');
  }
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  req.session['userID'] = userId;
  res.redirect('/urls');
});

// this route renders the template for the urls page, which lists every url registered under the current user. redirects if user is not logged in.
app.get('/urls', (req, res) => {
  const user = req.session['userID'];
  if (!user) {
    return res.status(403).send("403: You need to be logged in to see a list of urls");
  }
  const urls = urlsByUserID(users[user].id, urlDatabase);
  const templateVars = {
    urls,
    user: users[user]
  };
  res.render('urls_index', templateVars);
});

// this is to add a new url to the url database, POST route
app.post("/urls", (req, res) => {
  const user = req.session['userID'];
  if (!user) {
    return res.status(403).send('Status code 403, You cannot add a new url without being logged in');
  }
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL,
    longURL,
    userID: user
  };
  res.redirect(`/urls/${shortURL}`);
});

// renders a page in which the user can make a new shortURL by entering a full one. Only is logged in 
app.get("/urls/new", (req, res) => {
  const user = req.session['userID'];
  if (!user) {
    res.redirect('/login');
  }
  const templateVars = {
    urlDatabase,
    user: users[user]
  };
  res.render("urls_new", templateVars);
});

// Redirects user to the corresponding long url, the key functionality of our web-app
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send('404: There is no redirect set up for this url');
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// renders a page where a logged in user can edit the long url associated with an existing short url.
app.get("/urls/:shortURL", (req, res) => {
  const user = req.session['userID'];
  if (!user) {
    return res.status(403).send("403: You must be logged in to update URLs");
  }
  const urls = urlsByUserID(users[user].id, urlDatabase);
  if (urls[req.params.shortURL] === undefined) {
    return res.status(403).send("403: You do not own a url with this ID");
  }
  const templateVars = {
    shortURL: urls[req.params.shortURL].shortURL,
    longURL: urls[req.params.shortURL].longURL,
    user: users[user]
  };
  res.render("urls_show", templateVars);
});

// the Post route for the form in which the user edits the long URL for an existing short URL, updating it in the database
app.post("/urls/:id", (req, res) => {
  const user = req.session['userID'];
  const newUrl = req.body.newURL;
  const shortURL = req.body.shortURL;
  if (!user || user !== urlDatabase[shortURL].userID) {
    return res.status(403).send('403: You do not have permission to change this url');
  }
  urlDatabase[shortURL].longURL = newUrl;
  res.redirect('/urls');
});

// a POST route for deleting an existing URL, only if it belongs to the user trying to delete it.
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = req.session['userID'];
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(403).send('403: This url does not exist');
  }
  if (urlDatabase[shortURL].userID === user) {
    delete urlDatabase[req.body.delete];
    return res.redirect('/urls');
  }
  return res.status(403).send('403: You do not have permission to delete this url');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
