import { Router } from "express";
import crypto from "crypto";
import Mailjet from "node-mailjet";
import { getorderConfirmationTemplate, getVerificationEmailTemplate } from "../helpers/mailTemplates.js";
// import { getVerificationEmailTemplate } from "./helpers/mailtemplates"; // Import the template function

const testMail = Router();

// Initialize Mailjet
const mail = Mailjet.apiConnect(
  "5185ebe887293c5fe808ad398884c4e0",
  "e58385ebae558a56a2c99b4da33b4b8a",
  { config: {}, options: {} }
);

export const sendVerificationCode = async (verificationCode, email) => {
  try {
    // Get the email template with the verification code
    const emailTemplate = getVerificationEmailTemplate(verificationCode);

    // Send email using Mailjet API
    const request = mail.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "reeyaskarki@gmail.com", // Sender email address
            Name: "Sneaker Head",
          },
          To: [
            {
              Email: email, // Recipient email address
              Name: "You",
            },
          ],
          Subject: "Verification Code",
          TextPart: `Your verification code is: ${verificationCode}`,
          HTMLPart: emailTemplate, // Use the generated HTML template
        },
      ],
    });

    // Send the email and log the result
    
  } catch (err) {
    console.error("Error sending email:", err.statusCode);
  }
};


export const sendOrderConfirmation = async (email,orderId,img,name,price,quantity,shippingFees,total ) => {
  const orderTemplate = getorderConfirmationTemplate(orderId,img,name,price,quantity,shippingFees,total );
  const textPart = `Order Confirmation
  Hello,
  
  Thank you for your order! We are pleased to confirm your purchase. Here are your order details:
  
  Order Number: ${orderId}
  
  Order Summary:
  - Product: ${name}
  - Price: ${price}
  - Quantity: ${quantity}
  - Shipping Fees: ${shippingFees}
    
  Total: ${total}
  
  We appreciate your business and hope you enjoy your purchase!
  
  Thank you,
  Md sajid
  Sneaker head, Itahari-20, Tarahara
  `;
  try {
    const request = mail.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "reeyaskarki@gmail.com", // Sender email address
            Name: "Me",
          },
          To: [
            {
              Email: email, // Recipient email address
              Name: "You",
            },
          ],
          Subject: "Order  confirmation",
          TextPart:textPart,
          HTMLPart: orderTemplate, // Use the generated HTML template
        },
      ],
    });
  } catch (error) {
    console.log("cant send email");
  }

}