const Category = require("../models/category");
const Item = require("../models/item")
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all Category.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, "name")
    .sort({name: 1})
    .exec();

  res.render("category_list", {title: "Category List", category_list: allCategories})
});

// Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec()
  ]);

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err)
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: itemsInCategory,
  });
});

// Display Genre create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  body("name", "Category must be contain at least three characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ name: req.body.name, description: req.body.description });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name, description: req.body.description }).exec()
      if (categoryExists) {
        res.redirect(categoryExists.url);
      }
      else {
        await category.save();

        res.redirect(category.url);
      }
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({category: req.params.id}, "name description").exec(),
  ]);

  if (category === null) {
    res.redirect("/catalog/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsByCategory,
  });
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({category: req.params.id}, "name description").exec(),
  ]);

  if (allItemsByCategory.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/catalog/categories");
  }
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category
  });
});

// Handle Category update on POST.
exports.category_update_post = [
  body("name", "Category must be contain at least three characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const category = new Category({ 
      name: req.body.name, 
      description: req.body.description,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const updateCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      res.redirect(updateCategory.url);
    }
  }),
];
