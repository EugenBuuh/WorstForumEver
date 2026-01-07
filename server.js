const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('.'));

const db = new sqlite3.Database('./forum.db');

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  content TEXT
)
`);

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password)
          VALUES ('${username}', '${password}')`);
  res.send('registered');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username='${username}' AND password='${password}'`,
    (err, user) => {
      if (!user) return res.send('login failed');
      res.cookie('user_id', user.id);
      res.send('logged in');
    }
  );
});

app.post('/post', (req, res) => {
  const userId = req.cookies.user_id;
  const { content } = req.body;
  db.run(`INSERT INTO posts (user_id, content)
          VALUES (${userId}, '${content}')`);
  res.send('posted');
});

app.get('/posts', (req, res) => {
  db.all(`
    SELECT posts.id, users.username, posts.content
    FROM posts
    JOIN users ON users.id = posts.user_id
  `, (err, rows) => {
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('defaultForum running on http://localhost:3000');
});
