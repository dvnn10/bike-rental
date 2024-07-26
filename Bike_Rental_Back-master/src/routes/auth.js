const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string');
const User = require('../models/User');
const validator = require('validator');
const { Code } = require('../models/SecretCode');
const gravatar = require('gravatar');

const { hash, compare } = require('../components/bcrypt');
const emailService = require('../components/nodemailer');
const authenticateTokenWhilePending = require('../middleware/checkAuthPending');
const authenticateToken = require('../middleware/checkUserAuth');
const { check, validationResult } = require('express-validator');
const checkManager = require('../middleware/checkManager');

const checkAnyAuth = require('../middleware/checkAnyAuth');

// #route:  POST /Login
// #desc:   Login a user
// #access: Public
router.post(
  '/login',
  [
    check('email_username', 'Please include valid email or Username')
      .not()
      .isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email_username, password } = req.body;
    let errorspush = [];

    if (!email_username || !password) {
      errorspush.push({ msg: 'Please fill in all fields!' });
      res.json({ success: false, errors: errorspush });
    } else {
      try {
        if (validator.isEmail(email_username)) {
          user = await User.findOne({ email: email_username }).select(
            '+password'
          );
        } else {
          user = await User.findOne({ username: email_username }).select(
            '+password'
          );
        }

        if (!user) {
          errorspush.push({
            msg: 'The provided email or username is not registered.',
          });
          res.json({ success: false, errors: errorspush });
        } else {
          const pwCheckSuccess = await compare(password, user.password);
          user = await User.findOne({ _id: user._id }, { password: 0 });
          if (!pwCheckSuccess) {
            errorspush.push({
              msg: 'Email or Username and password do not match.',
            });
            res.json({ success: false, errors: errorspush });
          } else {
            const token = jwt.sign(
              {
                userId: user._id,
                userRole: user.role,
                userStatus: user.status,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: 60 * 60 * 24 * 14,
              }
            );
            res.json({
              success: true,
              data: user,
              token: token,
              msg: 'Logged in Successfully',
            });
          }
        }
      } catch (err) {
        console.log('Error on /api/auth/login: ', err);
        res.json({ success: false });
      }
    }
  }
);

// #route:  POST /register
// #desc:   Register a new user
// #access: Public
router.post(
  '/register',
  [
    check('username', 'Username is Required').not().isEmpty().trim().escape(),
    check('firstName', 'firstName is Required').not().isEmpty(),
    check('lastName', 'lastName is Required').not().isEmpty(),
    check('email', 'Please include valid email').isEmail().normalizeEmail(),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Please enter a password with eight or more character')
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
      )
      .withMessage(
        'Your password must be at least 8 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.'
      ),
    // check('acceptance', 'acceptance is Required').isIn([true]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({
        success: false,
        errors: errors.array(),
      });
    }

    let errorspush = [];
    const {
      username,
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      password2,
    } = req.body;
    if (password != password2) {
      errorspush.push({ msg: 'The entered passwords do not match!' });
    }

    if (errorspush.length > 0) {
      res.status(500).json({ success: false, errors: errorspush });
    } else {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email });

        const existingUserName = await User.findOne({ username: username });

        if (existingUser || existingUserName) {
          if (existingUser) {
            errorspush.push({
              msg: 'The provided email is registered already.',
            });
          }
          if (existingUserName) {
            errorspush.push({
              msg: 'The provided username is not available.',
            });
          }
          res.status(500).json({ success: false, errors: errorspush });
        } else {
          const hashedPw = await hash(password);
          var avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: '404',
          });

          const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPw,
            avatar,
            contactNumber,
          });
          const user = await newUser.save();

          const token = jwt.sign(
            {
              userId: user._id,
              userRole: user.role,
              userStatus: user.status,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: 60 * 60 * 24 * 14,
            }
          );

          user['token'] = token;
          const baseUrl = process.env.BACKENDEND_BASE_URL;
          const secretCode = cryptoRandomString({
            length: 6,
          });
          const newCode = new Code({
            code: secretCode,
            email_username: user.email,
          });
          await newCode.save();
          const data = {
            from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM_USER}>`,
            to: user.email,
            subject: `Your Activation Link for ${process.env.APP_NAME}`,
            text: `Please use the following link within the next 10 minutes to activate your account on ${process.env.APP_NAME}: ${baseUrl}/auth/verification/verify-account/${user._id}/${secretCode}`,
            html: `<p>Please use the following link within the next 10 minutes to activate your account on ${process.env.APP_NAME}: <strong><a href="${baseUrl}/api/auth/verification/verify-account/${user._id}/${secretCode}" target="_blank">Email Verify</a></strong></p>`,
          };
          emailService.sendMail(data);

          res.status(200).json({
            success: true,
            data: user,
            msg: 'Signed Up Successfully',
          });
        }
      } catch (err) {
        console.log('Error on /auth/register: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
          err,
        });
        res.status(500).json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  POST /addUser
// #desc:   Register a new user or manager by Manager
// #access: Manager
router.post(
  '/manage/register',
  [
    checkManager,
    check('username', 'Username is Required').not().isEmpty().trim().escape(),
    check('firstName', 'firstName is Required').not().isEmpty(),
    check('lastName', 'lastName is Required').not().isEmpty(),
    check('email', 'Please include valid email').isEmail().normalizeEmail(),
    check('status', 'status is Required').not().isEmpty(),
    check('role', 'Please select user role').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }

    let errorspush = [];
    const {
      username,
      firstName,
      lastName,
      email,
      contactNumber,
      role,
      status,
    } = req.body;

    if (errorspush.length > 0) {
      res.status(200).json({ success: false, errors: errorspush });
    } else {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email });

        const existingUserName = await User.findOne({ username: username });

        if (existingUser || existingUserName) {
          if (existingUser) {
            errorspush.push({
              msg: 'The provided email is registered already.',
            });
          }
          if (existingUserName) {
            errorspush.push({
              msg: 'The provided username is not available.',
            });
          }
          res.json({ success: false, errors: errorspush });
        } else {
          const password = cryptoRandomString({
            length: 8,
          });
          const hashedPw = await hash(password);
          var avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: '404',
          });

          const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPw,
            avatar,
            status,
            role,
            contactNumber,
          });
          const user = await newUser.save();

          const baseUrl = process.env.BACKENDEND_BASE_URL;
          const secretCode = cryptoRandomString({
            length: 6,
          });
          const newCode = new Code({
            code: secretCode,
            email_username: user.email,
          });
          await newCode.save();
          const data = {
            from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM_USER}>`,
            to: user.email,
            subject: `Welcome to ${process.env.APP_NAME}`,
            text: `Please use the following link within the next 10 minutes to activate your account on ${process.env.APP_NAME}: ${baseUrl}/auth/verification/verify-account/${user._id}/${secretCode}`,
            html: `
            <p>Dear ${role}, Welcome onboard. You have been registered by one of our manager.</p><br>
            <p>Please use the following link within the next 10 minutes to activate your account on
             ${process.env.APP_NAME}: <strong><a href="${baseUrl}/auth/verification/verify-account/${user._id}/${secretCode}" 
             target="_blank">Email Verify</a></strong></p><br>
             <h3>Your account details are:</h3><br>
             <h5>Username: ${username}</h5><br>
             <h5>Email: ${email}</h5><br>
             <h5>Password: ${password}</h5><br><br>
             <p>* Please change your password once you login. Thanks & Regards</p>

             `,
          };
          emailService.sendMail(data);

          res.status(200).json({
            success: true,
            data: user,
            msg: 'Signed Up Successfully',
          });
        }
      } catch (err) {
        console.log('Error on /auth/register: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
          err,
        });
        res.status(500).json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  POST /password/change
// #desc:   Verify and save new password of user
// #access: Public
router.post(
  '/password/change',
  authenticateToken,
  [
    check('old_password', 'Password is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Confirm Password is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { old_password, password, password2 } = req.body;
    let errorspush = [];

    if (!old_password || !password || !password2) {
      errorspush.push({ msg: 'Please fill in all fields!' });
    }

    if (password != password2) {
      errorspush.push({ msg: 'The entered passwords do not match!' });
    }
    if (
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
      )
    ) {
      errorspush.push({
        msg: 'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
      });
    }
    user = await User.findOne({ _id: req.userId }).select('+password');
    if (!user) {
      errorspush.push({
        msg: 'The provided email or username is not registered.',
      });
    } else {
      const pwCheckSuccess = await compare(old_password, user.password);
      if (!pwCheckSuccess) {
        errorspush.push({
          msg: 'Old Password Did not Match',
          msg1: pwCheckSuccess,
        });
      }
    }
    if (errorspush.length > 0) {
      res.json({ success: false, errorspush });
    } else {
      try {
        const newHashedPw = await hash(password);
        await User.updateOne({ _id: req.userId }, { password: newHashedPw });
        res.json({ success: true, msg: 'Password Changed Successfully' });
      } catch (err) {
        console.log('Error on /auth/password/change: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
        });
        res.json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  POST /manager/password/change
// #desc:   Verify and save new password of user
// #access: Public
router.post(
  '/manager/password/change/:userId',
  checkManager,
  [
    check('password', 'Password is required').not().isEmpty(),
    check('password2', 'Confirm Password is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { password, password2 } = req.body;
    let errorspush = [];

    if (!password || !password2) {
      errorspush.push({ msg: 'Please fill in all fields!' });
    }

    if (password != password2) {
      errorspush.push({ msg: 'The entered passwords do not match!' });
    }
    if (
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
      )
    ) {
      errorspush.push({
        msg: 'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
      });
    }
    let user = await User.findOne({ _id: req.params.userId }, { password: 0 });

    if (!user) {
      errorspush.push({
        msg: 'The provided email or username is not registered.',
      });
    }
    if (errorspush.length > 0) {
      res.json({ success: false, errors: errorspush });
    } else {
      try {
        const newHashedPw = await hash(password);
        await User.updateOne({ _id: user._id }, { password: newHashedPw });
        res.json({ success: true, msg: 'Password Changed Successfully' });
      } catch (err) {
        console.log('Error on /auth/password/change: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
        });
        res.json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  GET /verification/get-activation-email
// #desc:   Send activation email to registered users email address
// #access: Private
router.get(
  '/verification/get-activation-email',
  authenticateTokenWhilePending,
  async (req, res) => {
    const baseUrl = process.env.BACKENDEND_BASE_URL;

    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.json({ success: false });
      } else {
        await Code.deleteMany({ email: user.email });

        const secretCode = cryptoRandomString({
          length: 6,
        });
        const newCode = new Code({
          code: secretCode,
          email_username: user.email,
        });
        await newCode.save();

        const data = {
          from: `Ankit Shah <${process.env.EMAIL_FROM_USER}>`,
          to: user.email,
          subject: `Your Activation Link for ${process.env.APP_NAME}`,
          text: `Please use the following link within the next 10 minutes to activate your account on ${process.env.APP_NAME}: ${baseUrl}/auth/verification/verify-account/${user._id}/${secretCode}`,
          html: `<p>Please use the following link within the next 10 minutes to activate your account on ${process.env.APP_NAME}: <strong><a href="${baseUrl}/auth/verification/verify-account/${user._id}/${secretCode}" target="_blank">Email Verify</a></strong></p>`,
        };
        emailService.sendMail(data);

        res.json({ success: true });
      }
    } catch (err) {
      console.log('Error on /auth/get-activation-email: ', err);
      res.json({ success: false });
    }
  }
);

// #route:  GET /verification/verify-account
// #desc:   Verify user's email address
// #access: Public
router.get(
  '/verification/verify-account/:userId/:secretCode',
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const response = await Code.findOne({
        email_username: user.email,
        code: req.params.secretCode,
      });

      if (!user) {
        res.sendStatus(401);
      } else {
        await User.updateOne({ email: user.email }, { status: 'active' });
        await Code.deleteMany({ email: user.email });

        let redirectPath;

        redirectPath = `${process.env.FRONTEND_BASE_URL}`;

        res.redirect(redirectPath);
      }
    } catch (err) {
      console.log('Error on /auth/verification/verify-account: ', err);
      res.sendStatus(500);
    }
  }
);

// #route:  GET /verification/update-user-status
// #desc:   Verify user's email address
// #access: Public
router.get(
  '/verification/update-user-status',
  authenticateTokenWhilePending,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        res.json({ success: false });
      } else {
        const token = jwt.sign(
          {
            userId: user._id,
            userRole: user.role,
            userStatus: user.status,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: 60 * 60 * 24 * 14,
          }
        );

        res.json({
          success: true,
          userRole: user.role,
          token: token,
          userId: user._id,
          userStatus: user.status,
        });
      }
    } catch (err) {
      console.log('Error on /auth/verification/update-user-status: ', err);
      res.json({ success: false });
    }
  }
);

// #route:  POST /password-reset/get-code
// #desc:   Reset password of user
// #access: Public
router.post(
  '/password-reset/get-code',
  [
    check('email_username', 'Please include valid email or Username')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email_username } = req.body;
    let errorspush = [];

    if (!email_username) {
      errorspush.push({ msg: 'Please fill in all fields!' });
      res.json({ success: false, errors: errorspush });
    } else {
      try {
        if (validator.isEmail(email_username)) {
          user = await User.findOne({ email: email_username });
        } else {
          user = await User.findOne({ username: email_username });
        }
        if (!user) {
          errorspush.push({
            msg: 'The provided email or username is not registered.',
          });
          res.json({ success: false, errors: errorspush });
        } else {
          const secretCode = cryptoRandomString({
            length: 6,
            type: 'numeric',
          });
          const newCode = new Code({
            code: secretCode,
            email_username: email_username,
          });
          await newCode.save();

          const data = {
            from: `Ankit Shah <${process.env.EMAIL_FROM_USER}>`,
            to: user.email,
            subject: 'Your Password Reset Code for Gharsansar App',
            text: `Please use the following code within the next 10 minutes to reset your password on Gharsansar App: ${secretCode}`,
            html: `<p>Please use the following code within the next 10 minutes to reset your password on Gharsansar App: <strong>${secretCode}</strong></p>`,
          };
          emailService.sendMail(data);

          res.json({ success: true, msg: 'Code Sent Successfuly' });
        }
      } catch (err) {
        console.log('Error on /auth/password-reset/get-code: ', err);
        errors.push({
          msg: 'Oh, something went wrong. Please try again!',
        });
        res.json({ success: false, errors });
      }
    }
  }
);

// #route:  POST /password-reset/otpverify
// #desc:   Verify and save new password of user
// #access: Public
router.post(
  '/password-reset/otpverify',
  [
    check('email_username', 'Please include valid email or Username')
      .not()
      .isEmpty(),
    check('code', 'Code is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email_username, code } = req.body;
    let errorspush = [];

    if (!email_username || !code) {
      errorspush.push({ msg: 'Please fill in all fields!' });
    }

    if (errors.length > 0) {
      res.json({ success: false, errors: errorspush });
    } else {
      try {
        const response = await Code.findOne({ email_username, code });
        if (response.length === 0) {
          errorspush.push({
            msg: 'The entered code is not correct. Please make sure to enter the code in the requested time interval.',
          });
          res.json({ success: false, errors: errorspush });
        } else {
          res.json({ success: true, msg: 'OTP has been verified' });
        }
      } catch (err) {
        console.log('Error on /auth/password-reset/otpverify: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
        });
        res.json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  POST /password-reset/verify
// #desc:   Verify and save new password of user
// #access: Public
router.post(
  '/password-reset/verify',
  [
    check('email_username', 'Please include valid email or Username')
      .not()
      .isEmpty(),
    check('password', 'Password is required').exists(),
    check('password2', 'Confirm Password is required').exists(),
    check('code', 'code is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email_username, password, password2, code } = req.body;
    let errorspush = [];

    if (!email_username || !password || !password2 || !code) {
      errorspush.push({ msg: 'Please fill in all fields!' });
    }
    if (password != password2) {
      errorspush.push({ msg: 'The entered passwords do not match!' });
    }
    if (
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
      )
    ) {
      errorspush.push({
        msg: 'Your password must be at least 6 characters long and contain a lowercase letter, an uppercase letter, a numeric digit and a special character.',
      });
    }
    if (errorspush.length > 0) {
      res.json({ success: false, errorspush });
    } else {
      try {
        const response = await Code.findOne({ email_username, code });

        if (response.length === 0) {
          errorspush.push({
            msg: 'The entered code is not correct. Please make sure to enter the code in the requested time interval.',
          });
          res.json({ success: false, errors: errorspush });
        } else {
          const newHashedPw = await hash(password);
          if (validator.isEmail(email_username)) {
            await User.updateOne(
              { email: email_username },
              { password: newHashedPw }
            );
          } else {
            await User.updateOne(
              { username: email_username },
              { password: newHashedPw }
            );
          }

          await Code.deleteOne({ email_username, code });
          res.json({ success: true, msg: 'Password Changed Successfully' });
        }
      } catch (err) {
        console.log('Error on /auth/password-reset/verify: ', err);
        errorspush.push({
          msg: 'Oh, something went wrong. Please try again!',
        });
        res.json({ success: false, errors: errorspush });
      }
    }
  }
);

// #route:  GET /logout
// #desc:   Logout a user
// #access: Public
router.get('/logout', authenticateTokenWhilePending, (req, res) => {
  jwt.destroy;
  res.json({ success: true, msg: 'Logged Out Successfully' });
});

// #route:  POST /delete-account
// #desc:   Logout a user
// #access: Public
router.delete('/delete-account', checkAnyAuth, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.json({ success: false, error: 'Please provide your password.' });
  } else {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        const pwCheckSuccess = await compare(password, user.password);
        if (!pwCheckSuccess) {
          res.json({
            success: false,
            error: 'The provided password is not correct.',
          });
        } else {
          const deleted = await User.deleteOne({
            email: user.email,
          });

          if (!deleted) {
            res.json({
              success: false,
              error: 'Oh, something went wrong. Please try again!',
            });
          } else {
            req.session = null;
            res.json({ success: true });
          }
        }
      }
    } catch (err) {
      console.log('Error on /api/auth/delete-account: ', err);
      res.json({
        success: false,
        error: 'Oh, something went wrong. Please try again!',
      });
    }
  }
});

// #route:  POST /delete-account
// #desc:   Logout a user
// #access: Public
router.delete(
  '/delete-user-account/:userId',
  checkManager,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        res.json({
          success: false,
          error: 'Oh, something went wrong. Please try again!',
        });
      } else {
        const deleted = await User.deleteOne({
          email: user.email,
        });

        if (!deleted) {
          res.json({
            success: false,
            error: 'Oh, something went wrong. Please try again!',
          });
        } else {
          req.session = null;
          res.json({ success: true });
        }
      }
    } catch (err) {
      console.log('Error on /api/auth/delete-account: ', err);
      res.json({
        success: false,
        error: 'Oh, something went wrong. Please try again!',
      });
    }
  }
);

module.exports = router;
