# Practice2

This is a simple full-stack register and login app.

The frontend is made with React and Vite. The backend is made with Express, MongoDB, Mongoose, and bcrypt.

## What The App Does

The app has three screens:

- Login screen
- Register screen
- Dashboard screen

A user can register with a username, email, and password. After that, the user can log in with the username and password. If the login is correct, the app shows a dashboard message.

This version is intentionally simple for practice. It does not use JWT, sessions, or persistent login.

## App.jsx Explanation

`App.jsx` is the main React component for the frontend.

```js
import { useState } from 'react';
import './App.css';
```

`useState` lets React remember values like the current screen, username, email, password, errors, and messages.

`App.css` is imported so the component can use the simple CSS styles.

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

This stores the backend API URL.

If `VITE_API_URL` is provided, the app uses that. Otherwise, it uses the local backend at `http://localhost:5001/api`.

```js
const [view, setView] = useState('login');
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [message, setMessage] = useState('');
```

These are state variables:

- `view` decides which screen to show: `login`, `register`, or `dashboard`.
- `username` stores the username typed by the user.
- `email` stores the email typed during registration.
- `password` stores the password typed by the user.
- `error` stores error messages.
- `message` stores success or dashboard messages.

```js
const isRegister = view === 'register';
```

This checks whether the current screen is the register screen.

It helps the same form work for both login and register.

```js
function clearForm() {
  setUsername('');
  setEmail('');
  setPassword('');
}
```

`clearForm` empties the input fields.

It is used after login, after register, when switching screens, and when logging out.

```js
async function handleSubmit(event) {
  event.preventDefault();
```

`handleSubmit` runs when the form is submitted.

`event.preventDefault()` stops the browser from refreshing the page.

```js
const path = isRegister ? '/register' : '/login';
const body = isRegister ? { username, email, password } : { username, password };
```

If the user is registering, the frontend sends data to `/register`.

If the user is logging in, the frontend sends data to `/login`.

The register request sends `username`, `email`, and `password`.

The login request sends only `username` and `password`.

```js
const response = await fetch(`${API_URL}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
```

This sends the form data to the backend.

- `method: 'POST'` means we are sending data.
- `Content-Type: application/json` tells the backend the data is JSON.
- `JSON.stringify(body)` converts the JavaScript object into JSON text.

```js
const data = await response.json();
```

This reads the JSON response sent by the backend.

```js
if (!response.ok) {
  setError(data.error);
  return;
}
```

If the backend sends an error, the frontend displays it and stops the function.

```js
if (isRegister) {
  setMessage(data.message);
  setView('login');
} else {
  setUsername(data.username);
  setMessage(data.message);
  setView('dashboard');
}
```

After successful registration, the app shows a message and goes back to the login screen.

After successful login, the app stores the username, stores the dashboard message, and shows the dashboard screen.

```js
function logout() {
  setUsername('');
  setMessage('');
  setError('');
  clearForm();
  setView('login');
}
```

`logout` clears the data and returns to the login screen.

```js
function switchView(nextView) {
  setError('');
  setMessage('');
  clearForm();
  setView(nextView);
}
```

`switchView` changes from login to register or from register to login.

It also clears old errors, messages, and form inputs.

## JSX Explanation

The `return` part contains the HTML-like code shown on the page.

```jsx
{view === 'dashboard' ? (...) : (...)}
```

This is conditional rendering.

If `view` is `dashboard`, React shows the dashboard.

Otherwise, React shows the login/register form.

```jsx
{isRegister && (
  <input type="email" ... />
)}
```

The email input only appears on the register screen.

It does not appear on the login screen.

```jsx
value={username}
onChange={(event) => setUsername(event.target.value)}
```

This makes the input controlled by React.

Whenever the user types, React updates the state.

## server.js Explanation

`server.js` is the backend file.

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
```

These lines import packages:

- `express` creates the backend server.
- `mongoose` connects Node.js to MongoDB.
- `cors` allows the frontend and backend to talk to each other.
- `bcrypt` hashes and checks passwords.

```js
const app = express();
const PORT = process.env.PORT || 5001;
```

`app` is the Express application.

The backend runs on port `5001` unless another port is provided.

```js
app.use(cors());
app.use(express.json());
```

`cors()` allows requests from the frontend.

`express.json()` lets Express read JSON data from `req.body`.

```js
const User = mongoose.model(
  'User',
  new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  }),
);
```

This creates the `User` model.

Each user has:

- `username`
- `email`
- `password`

`required: true` means the field is compulsory.

`unique: true` means MongoDB should not allow duplicates for that field.

```js
const sendError = (res, error = 'Something went wrong', code = 400) =>
  res.status(code).json({ error });
```

`sendError` is a helper function.

It sends error responses in the same format each time.

## Register Route

```js
app.post('/api/register', async (req, res) => {
```

This route runs when the frontend sends a `POST` request to `/api/register`.

```js
const { username, email, password } = req.body;
```

This gets the form data sent by the frontend.

```js
await User.create({ username, email, password: await bcrypt.hash(password, 10) });
```

This creates a new user in MongoDB.

The password is not stored directly. It is hashed first using `bcrypt.hash`.

`10` is the salt rounds value. A higher number is more secure but slower.

```js
res.status(201).json({ message: 'User registered successfully' });
```

This sends a success message back to the frontend.

## Login Route

```js
app.post('/api/login', async (req, res) => {
```

This route runs when the frontend sends a `POST` request to `/api/login`.

```js
const { username, password } = req.body;
const user = await User.findOne({ username });
```

This gets the username and password from the frontend.

Then it searches MongoDB for a user with that username.

```js
if (!user || !(await bcrypt.compare(password, user.password))) {
  return sendError(res, 'Invalid credentials');
}
```

This checks two things:

- If the user does not exist, login fails.
- If the password does not match the hashed password in MongoDB, login fails.

```js
res.json({
  username: user.username,
  message: `Welcome to your dashboard, ${user.username}!`,
});
```

If login is successful, the backend sends the username and dashboard message to the frontend.

## MongoDB Connection

```js
mongoose
  .connect('mongodb://127.0.0.1:27017/practice2')
  .then(() => app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)))
  .catch((err) => console.error('MongoDB connection error:', err.message));
```

This connects to a local MongoDB database named `practice2`.

If the connection works, the Express server starts.

If the connection fails, it prints an error message.

## Basic Flow

1. User fills the register form.
2. React sends the data to `/api/register`.
3. Express receives the data.
4. bcrypt hashes the password.
5. Mongoose saves the user in MongoDB.
6. User fills the login form.
7. React sends the data to `/api/login`.
8. Express finds the user in MongoDB.
9. bcrypt compares the entered password with the saved hashed password.
10. If the login is correct, React shows the dashboard.

## Important Learning Points

- React state stores changing values on the frontend.
- Forms use `onChange` to update state.
- `fetch` sends data from frontend to backend.
- Express routes receive requests and send responses.
- Mongoose models define how data is stored in MongoDB.
- Passwords should be hashed before saving.
- The frontend and backend communicate using JSON.
