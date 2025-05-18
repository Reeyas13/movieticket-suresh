import crypto from "crypto";
import { getTokenInfo } from "./TokenHandler.js";
import prisma from "../prisma/prisma.js";

// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await orderService.getWhere();
//     res.json(orders);
//   } catch (err) {
//     return res.status(400).json({ error: err?.message || "No Orders found" });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    // const order = await orderService.save(req.body);
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { userId } = await getTokenInfo(token);
    const { orderId } = req.body;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
      },
      include: {
        products: true,
        shipping: true,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        userId: userId,
      },
    });
    const signature = createSignature(  
      `total_amount=${payment.amount},transaction_uuid=${payment.id},product_code=EPAYTEST`
    );
    console.log(signature);

    const formData = {
      amount: order.products.price * order.quantity,
      failure_url: "http://localhost:5000/api/esewa/failure",
      product_delivery_charge: parseInt(order.shipping.shippingFee),
      product_service_charge: "0",
      product_code: "EPAYTEST",
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: "http://localhost:5000/api/esewa/success",
      tax_amount: "0",
      total_amount: payment.amount,
      transaction_uuid: payment.id,
    };
    return res.json({
      message: "Order Created Successfully",
      order,
      payment_method: "esewa",
      formData,
      success: true,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err?.message || "Error creating order" });
  }
};

const createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q"; 
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
  const hashInBase64 = hmac.digest("base64");
  return hashInBase64;
};
