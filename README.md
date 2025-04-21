# Tech Blog - Express & Handlebars

This project is a simple tech blog platform built using Node.js, Express, Handlebars, and MongoDB. It features user authentication (login, password reset), post management (CRUD operations), and a public-facing blog interface.

## Features

*   Public blog view (posts, comments)
*   User authentication (login, logout)
*   Password reset functionality (forgot password, reset link via email)
*   Admin dashboard (protected)
*   Post management (Create, Read, Update, Delete - currently using sample data)
*   Comment submission (currently redirects without saving)
*   Markdown support for post content with server-side rendering
*   Syntax highlighting for code blocks
*   TailwindCSS for styling
*   Responsive design

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Templating:** Handlebars.js (`express-handlebars`)
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** Passport.js (Local Strategy)
*   **Session Management:** `express-session` with `connect-mongo` for persistent storage
*   **Password Hashing:** bcrypt.js
*   **Styling:** TailwindCSS (with PostCSS)
*   **Email Sending:** Nodemailer (for password reset)
*   **Validation:** `express-validator`
*   **Environment Variables:** `dotenv`
*   **Development:** `nodemon`, `concurrently`

## Prerequisites

*   Node.js (LTS version recommended, e.g., v18 or v20+)
*   npm (usually comes with Node.js)
*   MongoDB instance (local or cloud-based like MongoDB Atlas)
*   An SMTP server or email service (like SendGrid, Mailgun, or even a Gmail account for development) for sending password reset emails.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Copy the contents of `.env.example` (if it exists) or add the following variables, replacing the placeholder values with your actual credentials:

    ```dotenv
    # Application
    NODE_ENV=development
    PORT=3000

    # MongoDB
    MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

    # Session
    SESSION_SECRET=your_strong_random_session_secret_here

    # Email (for password reset)
    # Example using Gmail (less secure, use app password if 2FA enabled)
    # For production, use a dedicated email service like SendGrid or Mailgun
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587 # or 465 for SSL
    EMAIL_SECURE=false # true for 465, false for 587 (STARTTLS)
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_email_password_or_app_password
    EMAIL_FROM='"Your Blog Name" <your_email@gmail.com>' # Sender name and address
    ```

4.  **Initialize Admin User (Optional but Recommended):**
    *   The project uses sample data including a default admin user (`admin@example.com` / `qwer1234`).
    *   If you want to create a specific admin user in your database (especially if not using sample data later):
        ```bash
        npm run init-admin -- --email youradmin@email.com --password yoursecurepassword
        ```
        *(This script might need creation or adjustment based on `utils/initAdmin.js`)*

## Running the Application

*   **Development Mode (with auto-reload and CSS watching):**
    ```bash
    npm run dev
    ```
    This command uses `concurrently` to run `nodemon` (to watch server files) and `postcss` (to watch Tailwind CSS files) simultaneously.

*   **Production Mode:**
    ```bash
    npm run build:css # Build optimized CSS first
    npm start
    ```
    This will start the server using `node server.js`.

## Available Scripts

*   `npm start`: Starts the application in production mode (requires CSS to be built beforehand).
*   `npm run dev`: Starts the application in development mode with file watching and auto-restarts.
*   `npm run build:css`: Compiles and minifies Tailwind CSS for production.
*   `npm run watch:css`: Watches Tailwind CSS source files and recompiles on changes (used by `dev` script).
*   `npm run init-admin`: (Requires implementation/verification) Script to initialize an admin user in the database.

## Project Structure

```
.env                # Environment variables (ignored by git)
.gitignore          # Git ignore rules
config/
  db.js             # Database connection logic
  handlebars.js     # Handlebars engine configuration and helpers
  passport.js       # Passport authentication strategies and serialization
controllers/
  adminController.js  # Logic for admin routes
  authController.js   # Logic for authentication routes
  indexController.js  # Logic for public/index routes
data/
  sampleData.js     # Sample posts, comments, and user data (for development)
middleware/
  auth.js           # Authentication middleware (e.g., ensureAuthenticated)
models/
  User.js           # Mongoose model for Users
  (Post.js)         # (Potential future model for Posts)
  (Comment.js)      # (Potential future model for Comments)
node_modules/       # Project dependencies
package.json        # Project metadata and dependencies
package-lock.json   # Dependency lock file
postcss.config.js   # PostCSS configuration (for Tailwind)
public/
  css/              # Compiled CSS files (styles.css)
  js/               # Client-side JavaScript (if any)
  images/           # Static images
README.md           # This file
routes/
  admin.js          # Admin route definitions
  auth.js           # Authentication route definitions
  index.js          # Public route definitions
server.js           # Main application entry point (server setup, middleware, routing)
src/
  css/
    tailwind.css    # Main Tailwind CSS source file with imports
    fonts.css       # Custom font imports/definitions
    components.css  # Custom component styles
    markdown.css    # Markdown rendering styles
    forms.css       # Form styling
tailwind.config.js  # Tailwind CSS configuration
utils/
  emailSender.js    # Utility for sending emails (e.g., password reset)
  tokenGenerator.js # Utility for generating/hashing reset tokens
  initAdmin.js      # Script to initialize admin user
views/
  layouts/          # Handlebars layout files (main.hbs, admin.hbs)
  partials/         # Handlebars partial templates (header.hbs, footer.hbs, etc.)
  *.hbs             # Handlebars view templates for individual pages
```

## Environment Variables (.env)

*   `NODE_ENV`: Set to `development` or `production`. Affects error handling, logging, and cookie security.
*   `PORT`: The port the application will run on (default: 3000).
*   `MONGODB_URI`: Your MongoDB connection string.
*   `SESSION_SECRET`: A long, random, secret string used to sign the session ID cookie.
*   `EMAIL_HOST`: SMTP host for your email provider.
*   `EMAIL_PORT`: SMTP port (e.g., 587 for TLS, 465 for SSL).
*   `EMAIL_SECURE`: `true` if using SSL (port 465), `false` otherwise (for STARTTLS on port 587).
*   `EMAIL_USER`: Username for your email account.
*   `EMAIL_PASS`: Password (or app-specific password) for your email account.
*   `EMAIL_FROM`: The "From" address shown in emails (e.g., `"My Blog" <no-reply@myblog.com>`).



## License

(Specify your license here, e.g., MIT, ISC or leave blank if private)
