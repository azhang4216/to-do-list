const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongo_user = process.env.MONGO_USER;
const mongo_password = process.env.MONGO_PASSWORD;

mongoose.connect(
    "mongodb+srv://" + mongo_user + ":" + mongo_password + "@cluster0.f8jt9.mongodb.net/todolistDB",
    {useNewUrlParser: true, useUnifiedTopology: true }
);

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, items: [itemSchema]
})

const List = new mongoose.model("List", listSchema);
const Item = new mongoose.model("Item", itemSchema);

// default items to add when lists are empty
const item1 = new Item({name: "Wake Up"});
const item2 = new Item({name: "Work Out"});
const item3 = new Item({name: "Eat Breakfast"});

const defaultItems = [item1, item2, item3];

app.get("/", (_req, res) => {
    // insert default list if no default list; otherwise, go to home page
    List.findOne({name: "default"}, (e, defaultList) => {
        if (e) {
            console.log(e);
        } else {
            if (!defaultList) {
                const defaultList = new List({
                    name: "default", 
                    items: defaultItems
                });
                defaultList.save();

                setTimeout(() => { res.redirect("/"); }, 200);
            } else {
                console.log(defaultList.items);
                res.render("list", {
                    title: date.getDate(),
                    items: defaultList.items,
                    route: "/",
                    listID: defaultList._id,
                });
            }
        }
    })
})

app.post("/delete", (req, res) => {
    const selectedItemId = req.body.checkbox;

    List.findOne({name: "default"}, (e, foundList) => {
        if (e || !foundList) {
            console.log(e || "no list found");
            res.render("error", {
                title: "Error Detected",
                errorMessage: "There was an issue with finding the default list. Please try again later." 
            })
        } else {
            foundList.items.id(selectedItemId).remove();
            foundList.save((e) => {
                if (e) {
                    console.log(e);
                    res.render("error", {
                        title: "Error Detected",
                        errorMessage: "There was an issue with deleting from the default list. Please try again later." 
                    })
                }
            });
        }
    })

    res.redirect("/");
})

app.post("/", (req, res) => {
    const newItemName = req.body.todo;

    List.findOne({name: "default"}, (e, foundList) => {
        if (e) {
            console.log(e);
        } else {
            if (foundList) {
                const newItem = new Item({name: newItemName});
                foundList.items.push(newItem);
                foundList.save();

                res.redirect("/");
            } else {
                res.render("error", {
                    title: "Error Detected",
                    errorMessage: "There was an issue with retrieving / creating the custom list " + listName + ". Please try again later." 
                })
            }
        }
    })
})

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, (e, foundList) => {
        if (!e) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();

                setTimeout(() => { res.redirect("/" + customListName); }, 200);
            } else {
                res.render("list", {
                    title: _.lowerCase(customListName),
                    items: foundList.items,
                    route: "/" + customListName,
                    listID: foundList._id,
                })
            }
        }
    })
})

app.post("/:customListName", (req, res) => {
    const newItemName = req.body.todo;
    const listName = req.params.customListName;

    List.findOne({name: listName}, (e, foundList) => {
        if (e) {
            console.log(e);
        } else {
            if (foundList) {
                newItem = new Item({name: newItemName});
                foundList.items.push(newItem);
                foundList.save();

                res.redirect("/" + listName);
            } else {
                res.render("error", {
                    title: "Error Detected",
                    errorMessage: "There was an issue with retrieving / creating the custom list " + listName + ". Please try again later." 
                })
            }
        }
    })
})

app.post("/delete/:customListName", (req, res) => {
    const selectedItemId = req.body.checkbox;
    const listName = req.params.customListName;
    
    List.findOne({name: listName}, (e, foundList) => {
        if (e || !foundList) {
            console.log(e || "no list found");
            res.render("error", {
                title: "Error Detected",
                errorMessage: "There was an issue with finding the default list. Please try again later." 
            })
        } else {
            foundList.items.id(selectedItemId).remove();
            foundList.save((e) => {
                if (e) {
                    console.log(e);
                    res.render("error", {
                        title: "Error Detected",
                        errorMessage: "There was an issue with deleting from the default list. Please try again later." 
                    })
                }
            });
        }
    })
    res.redirect("/" + listName);
})

app.listen(3000, () => {
    console.log("listening on port 3000")
})