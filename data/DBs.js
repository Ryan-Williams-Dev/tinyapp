const urlDatabase = {
  "b2xVn2": {
    shortURL: 'b2xVn2',
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  "9sm5xK": {
    shortURL: '9sm5xK',
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$4JpnCURwMbBrw0VDcZoageBE5hwRnw6wJ5n3YdJVgn/AYBrpXRcha" // "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$Wi1jK7yg/wR15E9A45oPZunde1ccVvv6uc1jpwbDLIiP6qsusg9TS" // should be the hash for 'dishwasher-funk'
  }
}  

module.exports = {
  urlDatabase,
  users
}