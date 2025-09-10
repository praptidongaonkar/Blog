const { Router } = require("express");
const path =require("path");
const multer = require("multer");
const User = require("../models/user");
const Blog = require("../models/blog");
const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin", { user: req.user });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});



router.post("/signin", async(req , res)=>{
   const {email , password} = req.body;
   
   try{
      const token = await User.matchPasswordAndGenerateToken(email, password);
      return res.cookie("token", token).redirect("/");
    } 
   catch(error) {
      return res.render("signin",{
      error: "Incorrect email or Password",
      });
   }
});

router.get("/blogs", async (req, res) => {
  if (!req.user) return res.redirect("/user/signin");

  const blogs = await Blog.find({ createdBy: req.user._id });
  res.render("myBlogs", { user: req.user, blogs });
});

router.get("/logout",(req , res)=>{
   res.clearCookie("token").redirect("/");
});


router.post("/signup",  async(req, res)=>{
   const {fullName , email , password}=req.body;
   await User.create({
    fullName,
    email,
    password,
   });

   return res.redirect("signin");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/uploads/profiles"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Profile page (show update form)
router.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/user/signin");
  res.render("profile", { user: req.user });
});

// Update profile photo
router.post(
  "/profile/photo",
  upload.single("profileImage"),
  async (req, res) => {
    if (!req.user) return res.redirect("/user/signin");

    await User.findByIdAndUpdate(req.user._id, {
      profileImageURL: "/uploads/profiles/" + req.file.filename,
    });

    res.redirect("/");
  }
);

module.exports = router;