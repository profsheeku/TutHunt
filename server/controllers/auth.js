const User = require("../models/user");
const Link = require("../models/link");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const {
    registerEmailParams,
    forgotPasswordEmailParams,
} = require("../helpers/email");
const shortid = require("shortid");
const _ = require("lodash");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

exports.register = async (req, res) => {
    // console.log("Register Controller", req.body);
    const { name, email, password } = req.body;
    // check if user already exists
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: "Email is taken",
            });
        }
        // generate token with username, email and password
        const token = jwt.sign(
            { name, email, password },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: "10m",
            }
        );

        // send email
        const params = registerEmailParams(email, name, token);

        const sendEmailOnRegister = ses.sendEmail(params).promise();

        sendEmailOnRegister
            .then((data) => {
                console.log("Email submitted to SES", data);
                res.json({
                    message: `Verification email has been sent to ${email}.`,
                });
            })
            .catch((error) => {
                console.log("ses email on register", error);
                res.status(422).json({
                    error: "We couldn't register you, please try again.",
                });
            });
    });
};

exports.registerActivate = (req, res) => {
    const { token } = req.body;

    // verify token
    jwt.verify(
        token,
        process.env.JWT_ACCOUNT_ACTIVATION,
        function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: "Expired verification link. Try again!",
                });
            }

            const { name, email, password } = jwt.decode(token);
            const username = shortid.generate();

            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    return res.status(401).json({
                        error: "Email is taken",
                    });
                }
                // create new user
                const newUser = new User({ username, name, email, password });
                newUser.save((err, result) => {
                    if (err) {
                        return res.status(401).json({
                            error: "Error saving user in database. Try again later.",
                        });
                    }
                    return res.json({
                        message:
                            "Registration is successful. You can continue to login",
                    });
                });
            });
        }
    );
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    // console.table({ email, password });
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email doesn't exist. Please register.",
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: "Email and password does not match.",
            });
        }
        // generate token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        const { _id, name, email, role } = user;

        return res.json({
            token,
            user: { _id, name, email, role },
        });
    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
});

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findOne({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        req.profile = user;
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findOne({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User not found",
            });
        }

        if (user.role !== "admin") {
            return res.status(400).json({
                error: "Admin resource, access denied",
            });
        }

        req.profile = user;
        next();
    });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    // check if user exits with that email
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "User with that email doesn't exist",
            });
        }
        // generate token and email to user
        const token = jwt.sign(
            { name: user.name },
            process.env.JWT_RESET_PASSWORD,
            { expiresIn: "10m" }
        );
        // send email
        const params = forgotPasswordEmailParams(email, token);

        // populate database with user reset password link
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: "Password reset failed. Try later",
                });
            }
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then((data) => {
                    console.log("ses reset W", data);
                    return res.json({
                        message: `Email has been sent to ${email}. Click on the link to reset your password`,
                    });
                })
                .catch((error) => {
                    console.log("ses reset pw failed", error);
                    return res.json({
                        message: `Could not verify email. Try again later`,
                    });
                });
        });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        // check if token expired
        jwt.verify(
            resetPasswordLink,
            process.env.JWT_RESET_PASSWORD,
            (err, success) => {
                if (err) {
                    return res.status(400).json({
                        error: "Expired link. Try again",
                    });
                }

                User.findOne({ resetPasswordLink }).exec((err, user) => {
                    if (err || !user) {
                        return res.status(400).json({
                            error: "Invalid token. Try again",
                        });
                    }

                    const updatedFiels = {
                        password: newPassword,
                        resetPasswordLink: "",
                    };

                    user = _.extend(user, updatedFiels);

                    user.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Reset password failed. Try Again",
                            });
                        }

                        res.json({
                            message: "All good! You can continue with login",
                        });
                    });
                });
            }
        );
    }
};

exports.canUpdateDeleteLink = (req, res, next) => {
    const { id } = req.params;
    Link.findOne({ _id: id }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: "Could not find link",
            });
        }
        let authorizedUser =
            data.postedBy._id.toString() === req.user._id.toString();

        if (!authorizedUser) {
            return res.status(400).json({
                error: "Unauthorized access",
            });
        }
        next();
    });
};
