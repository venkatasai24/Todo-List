//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(process.env.DATABASE,{useNewUrlParser:true});


const itemschema = new mongoose.Schema({
  name : String 
});

const item = mongoose.model("Item",itemschema);

const item1 = new item ({
  name : "Welcome to your TodoList!!"
});

const item2 = new item ({
  name : "Hit ⊕ to add new item"
})

const item3 = new item ({
  name : "Tick ☐ to delete item"
})

const defaultItems = [item1,item2,item3];

const listschema = new mongoose.Schema({
  name:String,
  items : [itemschema]
});

const list = mongoose.model("List",listschema);

app.get("/", function(req, res) {

  item.find()
  .then((items) => {
        // if(items.length===0)
        // {
        //   item.insertMany(defaultItems);
        //   res.redirect("/");
        // } 
        // else 
        // {
          res.render("list", {listTitle: "Today", newListItems:items});
        // }
      })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new item ({
    name : itemName
  });
  if(listName==="Today")
  {
    newItem.save();
    res.redirect("/");
  }
  else
  {
    list.findOne({ name: listName })
    .then(user => {
      if (user) {
        user.items.push(newItem);
        user.save();
        res.redirect("/"+listName);
      }
    });
    }
});

app.post("/delete", function(req, res) {
  const deletedId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    item.findByIdAndRemove(deletedId)
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    list.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deletedId } } }
    )
      .then((foundList) => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

app.get("/:newList",function(req,res)
{
  const listName = _.capitalize(req.params.newList);
  list.findOne({ name: listName })
  .then(user => {
    if (user) {
      res.render("list", {listTitle:user.name , newListItems:user.items});
    } else {
      const customerList = new list ({
        name : listName,
        items : [] 
      });
      customerList.save();
      res.redirect("/"+listName);
    }
  })
  .catch(err => console.error(err));
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
