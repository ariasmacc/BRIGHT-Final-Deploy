// controllers/userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET; 

exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { username, full_name, password, email, role, position } = req.body;

  User.findByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (user) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).json({ error: 'Error generating salt' });

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });

        User.create(username, full_name, hash, email, role, position, (err, newUser) => {
          if (err) {
            return res.status(500).json({ error: 'Error registering user' });
          }
          res.status(201).json({ message: 'User registered successfully!' });
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }
  if (role === 'Staff') {
    return res.status(401).json({ error: 'Invalid username, password, or role' });
  }

  User.findByUsername(username, (err, user) => {
    if (err) {
      console.error("Database error during findByUsername:", err.message);
      return res.status(500).json({ error: 'Database error during login' });
    }
    if (!user) {
       console.warn(`Login attempt failed: User '${username}' not found.`);
      return res.status(401).json({ error: 'Invalid username, password, or role' });
    }
    if (user.role !== role) {
        console.warn(`Role mismatch for user ${username}. Submitted: ${role}, DB: ${user.role}`);
        return res.status(401).json({ error: 'Invalid username, password, or role' });
    }

    const submittedPasswordTrimmed = password.trim();
    const storedHashTrimmed = user.password_hash ? user.password_hash.trim() : '';

    if (!storedHashTrimmed) {
        console.error(`User ${username} found but has no password hash in the database.`);
        return res.status(500).json({ error: 'User account configuration error.' });
    }

    bcrypt.compare(submittedPasswordTrimmed, storedHashTrimmed, (errcrypt, isMatch) => {
      if (errcrypt) {
        console.error("Error during bcrypt.compare:", errcrypt.message);
        return res.status(500).json({ error: 'Error comparing password' });
      }

      if (isMatch) {
        // 1. Create the VIP Pass (JWT Token)
        const payload = {
          userId: user.user_id,
          username: user.username,
          role: user.role,
          name: user.full_name 
        };

        // Sign the token using your secret from .env
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // 2. STICK THE COOKIE TO THE BROWSER
        // This is the most important part! This fixes the 401 errors.
        res.cookie('token', token, {
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production', 
          sameSite: 'lax', 
          maxAge: 3600000 // 1 hour
        });

        // 3. (Optional) Still send the email notification so you know it works
        const transporter = req.app.get('transporter');
        if (transporter) {
            transporter.sendMail({
                from: `"BRIGHT System" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'New Login Detected',
                html: `<p>Hello ${user.full_name}, you have successfully logged into the BRIGHT Dashboard.</p>`
            }).catch(err => console.error("Email notification failed:", err));
        }

        // 4. Tell the Frontend to go ahead and open the door
        return res.json({
          message: 'Login successful!',
          user: {
              id: user.user_id,
              name: user.full_name,
              username: user.username,
              role: user.role,
              position: user.position || 'Staff'
          }
        });
      } else {
        console.warn(`Password mismatch detected for user ${username}`);
        return res.status(401).json({ error: 'Invalid username, password, or role' });
      }
    });
  });
};

/**
 * 1. FORGOT PASSWORD
 * Handles the initial request from the user's email.
 */
exports.forgotPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email } = req.body;
  
  // Get the email transporter we set up in server.js
  const transporter = req.app.get('transporter');

  // Find user by email
  User.findByEmail(email, (err, user) => {
    if (err) {
      console.error("Database error during findByEmail:", err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // SECURITY: Always send a generic success message
    // This prevents attackers from guessing which emails are registered.
    if (!user) {
      console.log(`Password reset attempt for non-existent email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // 1. Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');

    // 2. Hash the token and set an expiry time (15 minutes)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    // This creates a 'YYYY-MM-DD HH:MM:SS' string that SQLite understands
    const expires = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // 3. Save the hashed token to the database
    // This will FAIL until you update models/User.js (see next step)
    User.saveResetToken(user.user_id, hashedToken, expires, (err) => {
      if (err) {
        console.error("Database error saving reset token:", err.message);
        return res.status(500).json({ error: 'Error saving reset token' });
      }

      // 4. Send the email (with the *unhashed* token)
      const resetLink = `https://bright-website.up.railway.app/reset-password.html?token=${token}`;

      transporter.sendMail({
        from: `"BRIGHT Admin" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request for BRIGHT',
        html: `
            <p>Hello ${user.full_name},</p>
            <p>You requested a password reset. Please click the link below to set a new password:</p>
            <p><a href="${resetLink}" style="font-size: 16px; font-weight: bold; color: white; background: #2c3e50; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
      }).catch(err => {
        console.error("Error sending password reset email:", err);
      });

      // Send the generic success message
      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    });
  });
};


/**
 * 2. RESET PASSWORD
 * Handles the form submission from the reset-password.html page.
 */
exports.resetPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { token, newPassword } = req.body;

  // 1. Hash the token from the URL to find it in the database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Find the user by the hashed token and check if it's expired
  // This will FAIL until you update models/User.js (see next step)
  User.findByResetToken(hashedToken, (err, user) => {
    if (err) {
      console.error("Database error during findByResetToken:", err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset link. Please try again.' });
    }

    // 3. Hash the new password (using bcryptjs)
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).json({ error: 'Error generating salt' });

      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });

        // 4. Update the user's password and clear the reset token
        // This will FAIL until you update models/User.js (see next step)
        User.updatePassword(user.user_id, hash, (err) => {
          if (err) {
            console.error("Database error updating password:", err.message);
            return res.status(500).json({ error: 'Error updating password' });
          }
          res.status(200).json({ message: 'Password has been reset successfully! You can now log in.' });
        });
      });
    });
  });
};

// ==========================================================
// === MGA BAGONG FUNCTIONS PARA SA ADMIN USER MANAGEMENT ===
// ==========================================================

/**
 * Kinukuha ang listahan ng lahat ng users para sa management table.
 */
exports.getAllUserRequests = (req, res) => {
  User.getAllRequests((err, users) => {
    if (err) {
      console.error("Error in userController.getAllUserRequests:", err.message);
      return res.status(500).json({ error: 'Database error while fetching user requests.' });
    }
    res.json(users);
  });
};

/**
 * Kinukuha ang bilang ng pending, approved, at rejected users para sa summary cards.
 */
exports.getUserSummary = (req, res) => {
  User.getStatusSummary((err, summary) => {
    if (err) {
      console.error("Error in userController.getUserSummary:", err.message);
      return res.status(500).json({ error: 'Database error while fetching user summary.' });
    }
    res.json(summary);
  });
};

/**
 * Ina-update ang status ng isang user (approve/reject).
 */
exports.updateUserStatus = (req, res) => {
  const { userId } = req.params;
  const { newStatus } = req.body; // Dapat 'approved' or 'rejected'

  // Basic validation
  if (!newStatus || !['approved', 'rejected'].includes(newStatus)) {
    return res.status(400).json({ error: 'Invalid or missing status provided.' });
  }

  User.updateStatus(userId, newStatus, (err, result) => {
    if (err) {
      console.error("Error in userController.updateUserStatus:", err.message);
      return res.status(500).json({ error: 'Database error while updating user status.' });
    }
    // Kung walang user na na-update (maling ID), mag-error
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found with the provided ID.' });
    }
    res.status(200).json({ message: `User status successfully updated to ${newStatus}` });
  });
};

/**
 * Updates username, email, name, and position.
 * Requires the user to enter their CURRENT password to confirm.
 */
exports.updateAccountSettings = (req, res) => {
  const { username, full_name, email, position, confirm_password } = req.body;
  const userId = req.user.userId; // Extracted from JWT token by auth middleware

  // 1. Find the user to check the password
  User.findByUsername(req.user.username, (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found or database error' });

    // 2. Verify the provided "Confirm Password"
    if (!user.password_hash) return res.status(500).json({ error: 'Account error: No password set.' });
    
    bcrypt.compare(confirm_password, user.password_hash.trim(), (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error verifying password' });
      if (!isMatch) return res.status(401).json({ error: 'Incorrect password. Changes not saved.' });

      // 3. Password is correct, proceed with update
      const newData = { username, full_name, email, position };
      User.updateAccountDetails(userId, newData, (updateErr) => {
        if (updateErr) {
          if (updateErr.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or Email is already taken.' });
          }
          return res.status(500).json({ error: 'Failed to update account details.' });
        }

        // Return success + updated info so frontend can update localStorage
        res.json({ 
          message: 'Account updated successfully!',
          user: { id: userId, username, name: full_name, role: user.role } 
        });
      });
    });
  });
};

/**
 * Changes the user's password.
 */
exports.changePassword = (req, res) => {
  const { current_password, new_password } = req.body;
  const userId = req.user.userId;

  User.findByUsername(req.user.username, (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });

    // 1. Verify CURRENT password
    bcrypt.compare(current_password, user.password_hash.trim(), (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error verifying password' });
      if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

      // 2. Hash the NEW password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).json({ error: 'Error generating salt' });
        
        bcrypt.hash(new_password, salt, (err, hash) => {
          if (err) return res.status(500).json({ error: 'Error hashing password' });

          // 3. Save to DB
          User.changePassword(userId, hash, (saveErr) => {
            if (saveErr) return res.status(500).json({ error: 'Failed to save new password' });
            res.json({ message: 'Password changed successfully!' });
          });
        });
      });
    });
  });
};

exports.verify2fa = (req, res) => {
    const { userId, twoFACode } = req.body;

    if (!userId || !twoFACode) {
        return res.status(400).json({ error: 'Missing required 2FA details.' });
    }

    // Hash the submitted code for lookup
    const hashedCode = crypto.createHash('sha256').update(twoFACode).digest('hex');

    User.findByTwoFACode(userId, hashedCode, (err, user) => {
        if (err) {
            console.error("Database error during findByTwoFACode:", err.message);
            return res.status(500).json({ error: 'Database error during 2FA verification.' });
        }
        
        if (!user) {
             // Clear the code to prevent brute-force attempts on expired codes
             User.clearTwoFACode(userId, () => {}); 
             return res.status(401).json({ error: 'Invalid or expired 2FA code.' });
        }

        // Code is correct and not expired: FINAL LOGIN SUCCESS!
        const payload = {
          userId: user.user_id,
          username: user.username,
          role: user.role,
          name: user.full_name 
        };
        
        if (!JWT_SECRET) {
            console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
            // Clear the 2FA code even if it failed here
            User.clearTwoFACode(user.user_id, () => {}); 
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Set the token as a secure, httpOnly cookie.
        res.cookie('token', token, {
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production', 
          maxAge: 3600000 
        });

        // Clear the 2FA code from the database immediately
        User.clearTwoFACode(user.user_id, () => {}); 

        console.log(`User ${user.username} successfully verified 2FA.`);

        // Send user info back to frontend
        res.json({
          message: 'Login successful!',
          user: {
              id: user.user_id,
              name: user.full_name,
              username: user.username,
              role: user.role,
              email: user.email,
              position: user.position || 'Staff'
          }
        });
    });
};