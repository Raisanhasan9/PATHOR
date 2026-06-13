const Booking = require("../models/Booking");
const Guide = require("../models/Guide");
const Review = require("../models/Review");
const { sendNotification } = require("../services/notificationService");
const {
  createBkashPayment,
  executeBkashPayment,
} = require("../services/bkashService");

const createBooking = async (req, res, next) => {
  try {
    const {
      guideId,
      destinationId,
      startDate,
      endDate,
      numberOfPeople,
      specialRequests,
      paymentMethod,
    } = req.body;

    const guide = await Guide.findById(guideId);
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Guide not found." });
    if (!guide.isVerified || !guide.isAvailable)
      return res
        .status(400)
        .json({ success: false, message: "Guide is not available." });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = guide.pricePerDay * totalDays;

    const booking = await Booking.create({
      traveller: req.user._id,
      guide: guideId,
      destination: destinationId,
      startDate: start,
      endDate: end,
      numberOfPeople,
      specialRequests,
      paymentMethod,
      pricePerDay: guide.pricePerDay,
      totalDays,
      totalAmount,
    });

    // Notify guide of new booking
    const guideData = await Guide.findById(guideId).populate("user", "_id");
    await sendNotification({
      userId: guideData.user._id,
      type: "booking_confirmed",
      title: "📅 New Booking Request",
      message: `You have a new booking request from ${req.user.name}.`,
      data: { bookingId: booking._id.toString() },
    });

    res.status(201).json({
      success: true,
      message: "Booking created. Awaiting guide confirmation.",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

const initiateBkashPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    if (booking.traveller.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not your booking." });
    if (booking.paymentStatus === "paid")
      return res.status(400).json({ success: false, message: "Already paid." });

    const bkashResponse = await createBkashPayment(
      booking.totalAmount,
      booking._id,
    );
    await Booking.findByIdAndUpdate(booking._id, {
      bkashPaymentID: bkashResponse.paymentID,
    });

    res.status(200).json({
      success: true,
      message: "bKash payment initiated.",
      data: {
        bkashURL: bkashResponse.bkashURL,
        paymentID: bkashResponse.paymentID,
      },
    });
  } catch (error) {
    next(error);
  }
};

const bkashCallback = async (req, res, next) => {
  try {
    const { paymentID, status } = req.query;
    if (status === "cancel" || status === "failure")
      return res
        .status(400)
        .json({ success: false, message: `Payment ${status}.` });

    const result = await executeBkashPayment(paymentID);
    if (result.statusCode === "0000") {
      await Booking.findOneAndUpdate(
        { bkashPaymentID: paymentID },
        { paymentStatus: "paid", bkashTrxID: result.trxID, paidAt: new Date() },
      );
      return res
        .status(200)
        .json({
          success: true,
          message: "Payment successful.",
          data: { trxID: result.trxID },
        });
    }

    res
      .status(400)
      .json({ success: false, message: "Payment verification failed." });
  } catch (error) {
    next(error);
  }
};

const respondToBooking = async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!["confirm", "decline"].includes(action))
      return res
        .status(400)
        .json({
          success: false,
          message: "Action must be confirm or decline.",
        });

    const guide = await Guide.findOne({ user: req.user._id });
    const booking = await Booking.findOne({
      _id: req.params.id,
      guide: guide._id,
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    if (booking.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Booking already responded to." });

    booking.status = action === "confirm" ? "confirmed" : "declined";
    booking.confirmedAt = action === "confirm" ? new Date() : null;
    await booking.save();

    // Notify traveller
    const populatedBooking = await Booking.findById(booking._id)
      .populate("destination", "name")
      .populate({ path: "guide", populate: { path: "user", select: "name" } });

    await sendNotification({
      userId: booking.traveller,
      type: action === "confirm" ? "booking_confirmed" : "booking_declined",
      title:
        action === "confirm" ? "✅ Booking Confirmed!" : "❌ Booking Declined",
      message:
        action === "confirm"
          ? `${populatedBooking.guide.user.name} confirmed your booking for ${populatedBooking.destination.name}.`
          : `Your booking for ${populatedBooking.destination.name} was declined. Try another guide.`,
      data: { bookingId: booking._id.toString() },
    });

    res
      .status(200)
      .json({
        success: true,
        message: `Booking ${booking.status}.`,
        data: { booking },
      });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    if (["completed", "cancelled"].includes(booking.status))
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel this booking." });

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || "Cancelled by traveller";
    await booking.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Booking cancelled.",
        data: { booking },
      });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { traveller: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate({
        path: "guide",
        populate: { path: "user", select: "name avatar" },
      })
      .populate("destination", "name division coverImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
};

const getGuideBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const guide = await Guide.findOne({ user: req.user._id });
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Guide profile not found." });

    const filter = { guide: guide._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("traveller", "name avatar phone")
      .populate("destination", "name division coverImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      traveller: req.user._id,
      status: "completed",
    });

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Completed booking not found." });
    if (booking.isReviewed)
      return res
        .status(400)
        .json({ success: false, message: "Already reviewed." });

    const review = await Review.create({
      booking: booking._id,
      traveller: req.user._id,
      guide: booking.guide,
      rating,
      comment,
    });

    booking.isReviewed = true;
    await booking.save();

    await Guide.findByIdAndUpdate(booking.guide, { $inc: { totalTrips: 1 } });

    res
      .status(201)
      .json({ success: true, message: "Review submitted.", data: { review } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  initiateBkashPayment,
  bkashCallback,
  respondToBooking,
  cancelBooking,
  getMyBookings,
  getGuideBookings,
  submitReview,
};
