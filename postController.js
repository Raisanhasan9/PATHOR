const Post = require("../models/Post");
const Destination = require("../models/Destination");

// GPS verification: check if user coords are within ~5km of destination
const isWithinRange = (userLat, userLng, destLat, destLng, radiusKm = 5) => {
  const R = 6371;
  const dLat = ((destLat - userLat) * Math.PI) / 180;
  const dLng = ((destLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= radiusKm;
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { type, content, locationName, destinationId, lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "GPS coordinates are required to post.",
      });
    }

    let isGpsVerified = false;

    // Verify GPS against destination if provided
    if (destinationId) {
      const destination = await Destination.findById(destinationId);
      if (
        destination &&
        destination.location?.coordinates?.lat &&
        destination.location?.coordinates?.lng
      ) {
        isGpsVerified = isWithinRange(
          parseFloat(lat),
          parseFloat(lng),
          destination.location.coordinates.lat,
          destination.location.coordinates.lng,
        );
      }
    }

    // Handle uploaded images
    const images = req.files ? req.files.map((f) => f.path) : [];

    const post = await Post.create({
      author: req.user._id,
      type,
      content,
      images,
      location: {
        name: locationName,
        destination: destinationId || null,
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      },
      isGpsVerified,
    });

    await post.populate("author", "name avatar role");

    res.status(201).json({
      success: true,
      message: isGpsVerified
        ? "Post created with GPS verification ✓"
        : "Post created (GPS not verified — not near destination).",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get community feed
// @route   GET /api/posts
// @access  Public
const getFeed = async (req, res, next) => {
  try {
    const { destination, type, verified, page = 1, limit = 10 } = req.query;

    const filter = { isActive: true };
    if (destination) filter["location.destination"] = destination;
    if (type) filter.type = type;
    if (verified === "true") filter.isGpsVerified = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name avatar role")
        .populate("location.destination", "name division")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-reportedBy"),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map((l) => l.toString()).includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((l) => l.toString() !== userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(req.user._id);
      post.likeCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Unliked." : "Liked.",
      data: { likeCount: post.likeCount, liked: !alreadyLiked },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text)
      return res
        .status(400)
        .json({ success: false, message: "Comment text required." });

    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    post.comments.push({ user: req.user._id, text });
    post.commentCount += 1;
    await post.save();

    await post.populate("comments.user", "name avatar");

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added.",
      data: { comment: newComment, commentCount: post.commentCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (own post or admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    await Post.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a post
// @route   PUT /api/posts/:id/report
// @access  Private
const reportPost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { reportedBy: req.user._id } },
      { new: true },
    );

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });

    // Auto-hide if reported by 5+ users
    if (post.reportedBy.length >= 5) {
      await Post.findByIdAndUpdate(req.params.id, { isActive: false });
    }

    res.status(200).json({ success: true, message: "Post reported." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name avatar role")
      .populate("comments.user", "name avatar")
      .populate("location.destination", "name division");

    if (!post || !post.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
  reportPost,
  getPost,
};
