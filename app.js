//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// npm install mongoose and require it
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// sets the connection for mongoDB and mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true})

// creates schema of whatever thing you want
const itemsSchema = {
  name: String
}
// creates the model for the schema
const Item = mongoose.model("Item", itemsSchema)

// created new items to save to DB
const walkDog = new Item({
  name: "Walk the dog"
})

const cookDinner = new Item({
  name: "Cook Dinner"
})

const foldLaundry = new Item({
  name: "Fold the Laundry"
})

const defaultItems = [walkDog, cookDinner, foldLaundry]

Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  } else {
    console.log("Successfully inserted Items");
  }
})



app.get("/", function(req, res) {


  res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
