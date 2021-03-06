var express =  require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); // don't need to name index.js
var geocoder = require("geocoder");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // console.log(req.user);
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});  // , currentUser: req.user
        }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
        console.log("location data" + data);
       var lat = data.results[0].geometry.location.lat; 
       var lng = data.results[0].geometry.location.lng; 
       var location = data.results[0].formatted_address;
       var newCampground = {name: name, price: price, image: image, description: desc, author:author, location:location, lat:lat, lng:lng};
         //Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if (err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                // console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        }); 
    });
});

// NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
         if (err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect('back');
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    console.log("req.body.location: " + req.body.location);
   geocoder.geocode(req.body.location, function(err, data){
       var lat = data.results[0].geometry.location.lat; 
       var lng = data.results[0].geometry.location.lng; 
       var location = data.results[0].formatted_address;
       var newData = {name: req.body.name, price: req.body.price, image: req.body.image, description: req.body.desc, location:location, lat:lat, lng:lng};
        // find and update the correct campground
       Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, updatedCampground){
          if (err) {
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success", "Successfully Updated!");
              res.redirect("/campgrounds/" + req.params.id);
          }
        });
   });
   // redirect somewhere(show page)
});

// Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;
