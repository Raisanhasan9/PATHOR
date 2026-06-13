const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
  reportPost,
  getPost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const { uploadPostImage } = require("../config/cloudinary");

router.get("/", getFeed);
router.get("/:id", getPost);
router.post("/", protect, uploadPostImage.array("images", 5), createPost);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);
router.put("/:id/report", protect, reportPost);

module.exports = router;
