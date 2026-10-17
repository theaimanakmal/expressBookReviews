const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
 
const BASE_URL = "http://localhost:5000";
 
// Task 6: Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
 
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user. Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }
 
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});
 
// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});
 
// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});
 
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksbyauthor = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author)
    .map(isbn => ({ isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
 
  if (booksbyauthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor }, null, 4));
  }
  return res.status(404).json({ message: "No books found for this author" });
});
 
// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksbytitle = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase() === title)
    .map(isbn => ({ isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
 
  if (booksbytitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle }, null, 4));
  }
  return res.status(404).json({ message: "No books found with this title" });
});
 
// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});
 
 
// ---------------------------------------------------------------
// Tasks 10-13: the same lookups using Axios with async/await
// ---------------------------------------------------------------
 
// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});
 
// Task 11: Get book details based on ISBN using a Promise with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(error => {
      const status = error.response ? error.response.status : 500;
      res.status(status).json({ message: `Error fetching book with ISBN ${isbn}`, error: error.message });
    });
});
 
// Task 12: Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error fetching books by ${author}`, error: error.message });
  }
});
 
// Task 13: Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: `Error fetching books titled ${title}`, error: error.message });
  }
});
 
module.exports.general = public_users;
 
