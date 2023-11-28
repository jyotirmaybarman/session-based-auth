const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Use session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie:{
    sameSite: "strict",
    httpOnly: true,
    secure: false // set it to true for HTTPS
  }
}));

// In-memory user database (for demonstration)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {

    console.log(req.session);
     return res.redirect('/profile');
    }
    return next();
};

// Login route - render login form
app.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login');
});

// POST request for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = user; // Store user data in session
    res.redirect('/profile');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Protected route - requires authentication
app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Logout route
app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).send('Error logging out');
      } else {
        res.redirect('/login');
      }
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
