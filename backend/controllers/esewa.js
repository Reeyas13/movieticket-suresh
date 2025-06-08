import prisma from "../prisma/prisma.js";

export const handleEsewaSuccess = async (req, res, next) => {
  try {
    const { data } = req.query;
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    console.log({ decodedData });

    if (decodedData.status !== "COMPLETE") {
      return res.status(400).json({ messgae: "errror" });
    }
    const message = decodedData.signed_field_names
      .split(",")
      .map((field) => `${field}=${decodedData[field] || ""}`)
      .join(",");
    // console.log({meaagemessage});

    req.transaction_uuid = decodedData.transaction_uuid;
    req.signature = decodedData.signature;
    req.total_amount = decodedData.total_amount;
    req.transaction_code = decodedData.transaction_code;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err?.message || "No Orders found" });
  }
};

export const updateOrderAfterPayment = async (req, res, next) => {
  try {
    const id = req.transaction_uuid;
    const signature = req.signature;
    const transaction_code = req.transaction_code;
    console.log({
      id: parseInt(id),
      signature: signature,
      transaction_code: transaction_code,
    });
    const payment = await prisma.payment.update({
      where: {
        id:id,
      },
      data: {
        signature: signature,
        transaction_code: transaction_code,
        status: "SUCCESS",
      },
    });
    // console.log(object);
    // const order = await prisma.order.findFirst({
    //   where: {
    //     id: parseInt(payment.orderId),
    //   },
    //   include: {
    //     products: true,
    //     payments: true,
    //   },
    // });

    // console.log(order);
    // const payments = await prisma.orderPayment.update({
    //   where: {
    //     id: parseInt(order.payment_id),
    //   },
    //   data: {
    //     provider: "esewa",
    //     amountPaid: parseFloat(req.total_amount),
    //     paymentType: "esewa",
    //     paidAt: new Date(Date.now()),
    //   },
    // });

    res.redirect(
      "http://localhost:5173/payment-success?transaction_code=" +
        transaction_code +
        "&transaction_uuid=" +
        id
    );
    /**
     * update the status to sucess after reacthing this end point no need to update the status if failure
     * it is already set to failure at default
     */
  } catch (err) {
    return res.status(400).json({ error: err?.message || "No Orders found" });
  }
};
const createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q"; //different in production
  // Create an HMAC-SHA256 hash
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);

  // Get the digest in base64 format
  const hashInBase64 = hmac.digest("base64");
  return hashInBase64;
};
