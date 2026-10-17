const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
 
let users = [];
 
// Returns true if the username is NOT already taken
const isValid = (username)=>{
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length === 0;
}
 
// Returns true if the username and password match a registered user
const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user) => user.username === username && user.password === password);
  return validusers.length > 0;
}
 
// Task 7: Login as a registered user
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
 
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
 
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});
 
// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
 
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
 
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});
 
// Task 9: Delete your own book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
 
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }
 
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.`
  });
});
 
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
 
