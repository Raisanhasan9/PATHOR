const axios = require("axios");

const BKASH_BASE_URL = process.env.BKASH_BASE_URL;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  username: process.env.BKASH_USERNAME,
  password: process.env.BKASH_PASSWORD,
};

// Step 1: Get bKash token
const getBkashToken = async () => {
  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    { headers },
  );
  return response.data.id_token;
};

// Step 2: Create payment
const createBkashPayment = async (amount, bookingId) => {
  const token = await getBkashToken();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/create`,
    {
      mode: "0011",
      payerReference: bookingId.toString(),
      callbackURL: `${process.env.API_BASE_URL}/api/payments/bkash/callback`,
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: `PATHOR-${bookingId}`,
    },
    {
      headers: {
        ...headers,
        authorization: token,
      },
    },
  );

  return response.data;
};

// Step 3: Execute payment (after user pays)
const executeBkashPayment = async (paymentID) => {
  const token = await getBkashToken();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        ...headers,
        authorization: token,
      },
    },
  );

  return response.data;
};

module.exports = { createBkashPayment, executeBkashPayment };
