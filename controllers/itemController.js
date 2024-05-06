const Item = require("../models/item");
const Category = require("../models/category")
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [
    numItems,
    numCategories,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Grocery Store Home",
    item_count: numItems,
    category_count: numCategories,
  })
});

// Display list of all item.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name category")
    .sort({name: 1})
    .populate("category")
    .exec();

  res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const [item] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
  ]);

  if (item === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err)
  }

  res.render("item_detail", {
    title: "Item Detail",
    item: item,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  })
});

// Handle item create on POST.
exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category]
    }
    next();
  },

  body("name", "Name must not be empty")
    .trim()
    .isLength({ mine: 1 })
    .escape(),
  body("description", "Description must not be emtpy")
    .trim()
    .isLength({ mine: 1 })
    .escape(),
  body("price", "Must be a number")
    .isFloat()
    .escape(),
  body("stock", "Must be a numver")
    .isNumeric()
    .escape(),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category
    });

    if (!errors.isEmpty()) {
      const [allCategories] = await Promise(Category.find().sort({ name: 1 }).exec());

      res.render("item_form", {
        title: "Create Item",
        item: item,
        categories: allCategories,
        errors: errors.array()
      });
    } else {
      await item.save();
      res.redirect(item.url)
    }
  })
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const [item] = await Promise.all([
    Item.findById(req.params.id).exec(),
  ]);

  if (item === null) {
    res.redirect("/catalog/items");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/catalog/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    categories: allCategories,
    item: item
  });
});

// Handle item update on POST.
exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category = typeof req.body.category === "undefined" ? [] : [req.body.category]
    }
    next();
  },

  body("name", "Name must not be empty")
    .trim()
    .isLength({ mine: 1 })
    .escape(),
  body("description", "Description must not be emtpy")
    .trim()
    .isLength({ mine: 1 })
    .escape(),
  body("price", "Must be a number")
    .isFloat()
    .escape(),
  body("stock", "Must be a numver")
    .isNumeric()
    .escape(),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      const [allCategories] = await Promise(Category.find().sort({ name: 1 }).exec());

      res.render("item_form", {
        title: "Update Item",
        item: item,
        categories: allCategories,
        errors: errors.array()
      });
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      res.redirect(updatedItem.url)
    }
  })
];