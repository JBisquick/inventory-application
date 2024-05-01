#! /usr/bin/env node

console.log(
    'This script populates some test items and catergories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Category = require("./models/category");
  
  const items = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // genre[0] will always be the Fantasy genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name, description) {
    const category = new Category({ name: name, description: description });
    await category.save();
    categories[index] = category;
    console.log(`Added Category: ${name}`);
  }
  
  async function itemCreate(index, name, description, price, stock, category) {
    const itemdetail = {
      name: name,
      description: description,
      price: price,
      stock: stock,
      category: category,
    };
  
    const item = new Item(itemdetail);
    await item.save();
    items[index] = item;
    console.log(`Added book: ${name}`);
  }

  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
      categoryCreate(0, "Produce", "Fresh vegetables and fruits"),
      categoryCreate(1, "Beverages", "Things that you drink"),
      categoryCreate(2, "Medicine", "When you feel sick try some of this stuff out"),
    ]);
  }
  
  async function createItems() {
    console.log("Adding items");
    await Promise.all([
      itemCreate(0, "Broccoli", "A really yummy vegetable that gives you IBS", 3.50, 8, categories[0]),
      itemCreate(1, "Apple", "A fruit that will make you gassy", 1.75, 24, categories[0]),
      itemCreate(2, "Root Beer", "A fruit that will make you gassy", 1.50, 24, categories[1]),
      itemCreate(3, "Apple Juice", "The juice version of apples", 5.50, 5, categories[1]),
      itemCreate(4, "Dayquil", "Stuff that will make you feel less sick", 6.50, 9, categories[2]),
  ])}