const { check } = require("express-validator");

exports.categoryCreateValidator = [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("image").trim().isBase64().withMessage("Image is required"),
    check("content")
        .isLength({ min: 20 })
        .withMessage("Content must be minimum 20 characters"),
];

exports.categoryUpdateValidator = [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("content")
        .isLength({ min: 20 })
        .withMessage("Content must be minimum 20 characters"),
];
