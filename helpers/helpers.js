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
function exsistingUserByEmail(email, users) {
  for (const user in users) {
    if (users[user]['email'] === email) {
      return users[user];
    }
  }
}

// fetches all urls for the user id passed into it, returns them in an object with the short url as a the key
function urlsByUserID(id, urlDatabase) {
  const result = {}
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url]
    }
  }
  return result;
} 

module.exports = {
  generateRandomString,
  exsistingUserByEmail,
  urlsByUserID
}