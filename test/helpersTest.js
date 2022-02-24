const { assert } = require('chai');
const { generateRandomString, getUserByEmail, urlsByUserID } = require('../helpers/helpers');
const { users, urlDatabase} = require('../data/DBs');

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users);
    const expectedUserID = {
      id: "userRandomID",
      email: "user@example.com",
      password: "$2a$10$4JpnCURwMbBrw0VDcZoageBE5hwRnw6wJ5n3YdJVgn/AYBrpXRcha"
    };
    assert.deepStrictEqual(user, expectedUserID);
  });
  it('should return undefined when there is user with that email', function() {
    const user = getUserByEmail("fakemail@gmail.com", users);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });
});