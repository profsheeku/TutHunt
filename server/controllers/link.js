const Link = require("../models/link");
const Category = require("../models/category");
const slugify = require("slugify");

exports.create = (req, res) => {
    const { title, url, categories, type } = req.body;

    const slug = url;
    let link = new Link({ title, url, categories, type, slug });
    // posted by user
    link.postedBy = req.user._id;
    // save link
    link.save((err, data) => {
        if (err) {
            return res.status(400).json({
                error: err,
            });
        }
        res.json(data);
    });
};

exports.list = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Link.find({})
        .populate("postedBy", "name")
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not list links",
                });
            }
            res.json(data);
        });
};

exports.read = (req, res) => {
    const { id } = req.params;
    Link.findOne({ _id: id }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: "Could not find the requested link",
            });
        }
        res.json(data);
    });
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { title, url, categories, type, medium } = req.body;
    const updatedLink = { title, url, categories, type, medium };

    Link.findOneAndUpdate({ _id: id }, updatedLink, { new: true }).exec(
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: "Error updating the link",
                });
            }
            res.json(updated);
        }
    );
};

exports.remove = (req, res) => {
    const { id } = req.params;
    Link.findOneAndRemove({ _id: id }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: "Could not delete",
            });
        }
        res.json({
            message: "Link deleted successfully",
        });
    });
};

exports.clickCount = (req, res) => {
    const { linkId } = req.body;
    Link.findByIdAndUpdate(
        linkId,
        { $inc: { clicks: 1 } },
        { upsert: true, new: true }
    ).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: "Could not update view count",
            });
        }
        res.json(result);
    });
};

exports.popular = (req, res) => {
    Link.find()
        .populate("postedBy", "name")
        .populate("categories", "name")
        .sort({ clicks: -1 })
        .limit(3)
        .exec((err, links) => {
            if (err) {
                return res.status(400).json({
                    error: "Links not found",
                });
            }
            res.json(links);
        });
};

exports.popularInCategory = (req, res) => {
    const { slug } = req.params;
    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return res.status(400).json({
                error: "Could not find categories",
            });
        }
        Link.find({ categories: category })
            .populate("postedBy", "name")
            .populate("categories", "name")
            .sort({ clicks: -1 })
            .limit(3)
            .exec((err, links) => {
                if (err) {
                    return res.status(400).json({
                        error: "Links not found",
                    });
                }
                res.json(links);
            });
    });
};
