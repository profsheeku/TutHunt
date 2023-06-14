const Category = require("../models/category");
const Link = require("../models/link");
const slugify = require("slugify");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid"); // random
const AWS = require("aws-sdk");
const fs = require("fs");
const category = require("../models/category");

// ASW s3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// exports.create = (req, res) => {
//     let form = new formidable.IncomingForm();
//     form.parse(req, (err, fields, files) => {
//         if (err) {
//             return res.status(400).json({
//                 error: "Image could not upload",
//             });
//         }
//         const { name, content } = fields;
//         const { image } = files;

//         const slug = slugify(name);
//         let category = new Category({ name, content, slug });
//         if (image.size > 2000000) {
//             return res.status(400).json({
//                 error: "Image should be less than 2MB",
//             });
//         }
//         // upload image to s3
//         const params = {
//             Bucket: "tuthunt",
//             Key: `category/${uuidv4()}`,
//             Body: fs.readFileSync(image.filepath),
//             ACL: "public-read",
//             ContentType: "image/jpg",
//         };

//         s3.upload(params, (err, data) => {
//             if (err) {
//                 console.log(err);
//                 res.status(400).json({ error: "Upload to s3 failed" });
//             }

//             category.image.url = data.Location;
//             category.image.key = data.Key;

//             // save to DB
//             category.save((err, success) => {
//                 if (err)
//                     res.status(400).json({
//                         error: "Duplicate category",
//                     });
//                 return res.json(success);
//             });
//         });
//     });
// };

exports.create = (req, res) => {
    const { name, imageUri, content } = req.body;
    // image data
    const base64Data = new Buffer.from(
        imageUri.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );
    const type = imageUri.split(";")[0].split("/")[1];

    const slug = slugify(name);
    let category = new Category({ name, content, slug });

    const params = {
        Bucket: "tuthunt",
        Key: `category/${uuidv4()}.${type}`,
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err);
            res.status(400).json({ error: "Upload to s3 failed" });
        }

        category.image.url = data.Location;
        category.image.key = data.Key;
        // posted by
        category.postedBy = req.user._id;

        // save to DB
        category.save((err, success) => {
            if (err)
                res.status(400).json({
                    error: "Duplicate category",
                });
            return res.json(success);
        });
    });
};

// exports.create = (req, res) => {
//     const { name, content } = req.body;
//     const slug = slugify(name);
//     const image = {
//         url: "https://via.placeholder.com/200x150",
//         key: "123",
//     };

//     const category = new Category({ name, slug, image });
//     category.postedBy = req.user._id;

//     category.save((err, data) => {
//         if (err) {
//             console.log("Category create error", err);
//             return res.status(400).json({
//                 error: "Category creation failed",
//             });
//         }
//         res.json(data);
//     });
// };

exports.list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: "Categories couldn't load",
            });
        }
        res.json(data);
    });
};

exports.read = (req, res) => {
    const { slug } = req.params;
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Category.findOne({ slug })
        .populate("postedBy", "_id name username")
        .exec((err, category) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not load category",
                });
            }
            Link.find({ categories: category })
                .populate("postedBy", "_id name username")
                .populate("categories", "name")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .exec((err, links) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Could not load links of this category",
                        });
                    }
                    res.json({ category, links });
                });
        });
};

exports.update = (req, res) => {
    const { slug } = req.params;
    const { name, imageUri, content } = req.body;

    Category.findOneAndUpdate({ slug }, { name, content }, { new: true }).exec(
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not find the category to update",
                });
            }
            if (imageUri) {
                // remove the existing image from s3 before replacing with new
                const deleteParams = {
                    Bucket: "tuthunt",
                    Key: `${updated.image.key}`,
                };

                s3.deleteObject(deleteParams, function (err, data) {
                    if (err) {
                        console.log("S3 object deletion error");
                    } else {
                        console.log("S3 deleted object successfully");
                    }
                });

                // upload new image
                const base64Data = new Buffer.from(
                    imageUri.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );
                const type = imageUri.split(";")[0].split("/")[1];

                const params = {
                    Bucket: "tuthunt",
                    Key: `category/${uuidv4()}.${type}`,
                    Body: base64Data,
                    ACL: "public-read",
                    ContentEncoding: "base64",
                    ContentType: `image/${type}`,
                };

                s3.upload(params, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json({ error: "Upload to s3 failed" });
                    }

                    updated.image.url = data.Location;
                    updated.image.key = data.Key;

                    // save to DB
                    updated.save((err, success) => {
                        if (err)
                            res.status(400).json({
                                error: "Duplicate category",
                            });
                        res.json(success);
                    });
                });
            } else {
                res.json(updated);
            }
        }
    );
};

exports.remove = (req, res) => {
    const { slug } = req.params;

    Category.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: "Could not delete category",
            });
        }

        // remove the existing image from s3
        const deleteParams = {
            Bucket: "tuthunt",
            Key: `${data.image.key}`,
        };

        s3.deleteObject(deleteParams, function (err, data) {
            if (err) {
                console.log("S3 object deletion error");
            } else {
                console.log("S3 deleted object successfully");
            }
        });

        res.json({
            message: "Category deleted succesfully",
        });
    });
};
