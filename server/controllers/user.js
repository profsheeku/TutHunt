const User = require("../models/user");
const Link = require("../models/link");

exports.read = (req, res) => {
    // req.profile.hashed_password = undefined;
    // req.profile.salt = undefined;
    User.findOne({ _id: req.user._id }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: "User not found",
            });
        }
        Link.find({ postedBy: user })
            .populate("categories", "name slug")
            .populate("postedBy", "name")
            .sort({ createdAt: -1 })
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({
                        error: "Links not found",
                    });
                }
                user.hashed_password = undefined;
                user.salt = undefined;
                res.json({ user, links });
            });
    });
};

exports.update = (req, res) => {
    const { name, password } = req.body;

    switch (true) {
        case password && password.length < 6:
            return res
                .status(400)
                .json({ error: "Password must be at least 6 characters long" });
            break;
    }

    User.findOneAndUpdate({ _id: req.user._id }, { name, password }, { new: true }).exec(
        (err, updated) => {
            if (err) {
                return res.status(400).json({ error: "Could not find user" });
            }
            updated.hashed_password = undefined;
            updated.salt = undefined;
            res.json(updated);
        }
    );
};
