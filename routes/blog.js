const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Multer config FIRST 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Routes 
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Edit blog 
router.get("/edit/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog || blog.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("/user/blogs");
  }
  res.render("editBlog", { user: req.user, blog });
});

// Update blog
router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog || blog.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("/user/blogs");
  }

  blog.title = req.body.title;
  blog.body = req.body.body;
  if (req.file) {
    blog.coverImageURL = "/uploads/" + req.file.filename;
  }
  await blog.save();
  res.redirect("/user/blogs");
});

// Delete blog
router.post("/delete/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog || blog.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("/user/blogs");
  }
  await blog.deleteOne();
  res.redirect("/user/blogs");
});

// Add new blog
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

// Edit comment (show form)
router.get("/comment/edit/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("back");
  }
  res.render("editComment", { user: req.user, comment });
});

// Update comment
router.post("/comment/edit/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("back");
  }
  comment.content = req.body.content;
  await comment.save();
  res.redirect(`/blog/${comment.blogId}`);
});


// Delete comment
router.post("/comment/delete/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.createdBy.toString() !== req.user._id.toString()) {
    return res.redirect("back");
  }
  await comment.deleteOne();
  res.redirect(`/blog/${comment.blogId}`);
});

module.exports = router;
