//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// npm install mongoose and require it
const mongoose = require("mongoose");
const _ = require('lodash')

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// sets the connection for mongoDB and mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// creates schema of whatever thing you want
const itemsSchema = {
  name: String
};
// creates the model for the schema
const Item = mongoose.model("Item", itemsSchema);

// created new items to save to DB
const walkDog = new Item({
  name: "Walk the dog"
});

const cookDinner = new Item({
  name: "Cook Dinner"
});

const foldLaundry = new Item({
  name: "Fold the Laundry"
});

const defaultItems = [walkDog, cookDinner, foldLaundry];

// -------------------------------------------------------------------------
// Created a new schema and model for our custom list routes
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
// -------------------------------------------------------------------------

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted Items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function(req, res) {
  // "newItem" and "list" are the NAME properties in the list ejs partial
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    //  you can use the findIdAndRemove method too!
    Item.deleteOne({ _id: checkedItemId }, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    // $pull is mongodb method, finds the item based on the id
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

// custom dynamic route
app.get("/:paramName", function(req, res) {
  const routeName = _.capitalize(req.params.paramName);

  List.findOne({ name: routeName }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: routeName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + routeName);
      } else {
        // Show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
