const Guide = require("../models/Guide");
const Booking = require("../models/Booking");

// @desc    Get guide earnings overview
// @route   GET /api/earnings
// @access  Private (guide)
const getEarnings = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Guide profile not found." });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get paid bookings
    const [allPaidBookings, thisMonthBookings, lastMonthBookings] =
      await Promise.all([
        Booking.find({ guide: guide._id, paymentStatus: "paid" })
          .populate("destination", "name")
          .populate("traveller", "name avatar")
          .sort({ paidAt: -1 })
          .limit(50),
        Booking.find({
          guide: guide._id,
          paymentStatus: "paid",
          paidAt: { $gte: startOfMonth },
        }),
        Booking.find({
          guide: guide._id,
          paymentStatus: "paid",
          paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }),
      ]);

    const thisMonthTotal = thisMonthBookings.reduce(
      (s, b) => s + b.totalAmount,
      0,
    );
    const lastMonthTotal = lastMonthBookings.reduce(
      (s, b) => s + b.totalAmount,
      0,
    );

    // Build monthly chart data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthBookings = allPaidBookings.filter((b) => {
        const paid = new Date(b.paidAt);
        return paid >= monthStart && paid <= monthEnd;
      });
      const total = monthBookings.reduce((s, b) => s + b.totalAmount, 0);
      monthlyData.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        year: monthStart.getFullYear(),
        total,
        trips: monthBookings.length,
      });
    }

    // Platform fee is 10%
    const platformFee = 0.1;
    const netThisMonth = Math.round(thisMonthTotal * (1 - platformFee));
    const netTotal = Math.round(guide.totalEarnings * (1 - platformFee));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings: guide.totalEarnings,
          netEarnings: netTotal,
          thisMonth: thisMonthTotal,
          netThisMonth,
          lastMonth: lastMonthTotal,
          pendingWithdrawal: guide.pendingWithdrawal,
          totalTrips: guide.totalTrips,
          platformFeePercent: platformFee * 100,
        },
        monthlyChart: monthlyData,
        recentTransactions: allPaidBookings.slice(0, 10).map((b) => ({
          id: b._id,
          traveller: b.traveller?.name,
          destination: b.destination?.name,
          amount: b.totalAmount,
          net: Math.round(b.totalAmount * (1 - platformFee)),
          date: b.paidAt,
          days: b.totalDays,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request withdrawal
// @route   POST /api/earnings/withdraw
// @access  Private (guide)
const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, bkashNumber } = req.body;

    const guide = await Guide.findOne({ user: req.user._id });
    if (!guide)
      return res
        .status(404)
        .json({ success: false, message: "Guide not found." });

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid withdrawal amount." });
    }

    if (amount > guide.pendingWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ৳${guide.pendingWithdrawal}`,
      });
    }

    // Deduct from pending (admin processes actual transfer manually or via bKash payout)
    await Guide.findByIdAndUpdate(guide._id, {
      $inc: { pendingWithdrawal: -amount },
    });

    // TODO: trigger bKash payout API in production

    res.status(200).json({
      success: true,
      message: `Withdrawal request of ৳${amount} submitted. Will be processed within 24 hours.`,
      data: {
        requestedAmount: amount,
        bkashNumber,
        remainingBalance: guide.pendingWithdrawal - amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// When a booking is completed, credit guide earnings
// Call this from booking completion logic
const creditGuideEarnings = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.paymentStatus !== "paid") return;

    await Guide.findByIdAndUpdate(booking.guide, {
      $inc: {
        totalEarnings: booking.totalAmount,
        pendingWithdrawal: booking.totalAmount,
        totalTrips: 1,
      },
    });
  } catch (error) {
    console.error("Credit earnings error:", error.message);
  }
};

module.exports = { getEarnings, requestWithdrawal, creditGuideEarnings };
