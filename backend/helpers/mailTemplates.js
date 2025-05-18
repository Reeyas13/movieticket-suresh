export const getVerificationEmailTemplate = (verificationCode) =>  `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset</title>
  <style>
    /* Fallback for email clients that don't support inline CSS */
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #6a0dad; /* Violet color */
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      color: #ffffff;
      background-color: #6a0dad;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #666666;
      background-color: #f4f4f4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Our Service</h1>
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>We are excited to have you on board! Below is your temporary password to log in:</p>
      
      <p style="font-size: 18px; font-weight: bold; color: #6a0dad;">Verification Code: <span style="background-color: #eee; padding: 5px 10px; border-radius: 3px;">${verificationCode}</span></p>

      <p>For security reasons, please don't share this code.</p>

      <p>If you didn’t request this email, please ignore it.</p>
      <p>Thank you, <br> Rohan Karki</p>
    </div>

    <div class="footer">
      <p>&copy; 2024 All rights reserved.</p>
      <p>Sneaker Head, Inaruwa</p>
    </div>
  </div>
</body>
</html>
`;

export const   getorderConfirmationTemplate =(orderId,img,name,price,quantity,shippingFees,total)=> `<!DOCTYPE html>
<html>
<head>
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #6a0dad; /* Violet color */
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .order-details {
      margin: 20px 0;
    }
    .order-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .order-item img {
      max-width: 80px;
      height: auto;
      margin-right: 10px;
      border-radius: 5px;
    }
    .order-item-details {
      flex: 1;
    }
    .order-summary {
      text-align: right;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      color: #ffffff;
      background-color: #6a0dad;
      text-decoration: none;
      border-radius: 5px;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #666666;
      background-color: #f4f4f4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>Thank you for your order! We are pleased to confirm your purchase. Here are your order details:</p>
      
      <p><strong>Order Number:</strong> ${orderId}</p>

      
      <div class="order-details">
        <h3>Order Summary</h3>

        <!-- Order Item Example -->
        <div class="order-item">
          <img src="${img}" alt="Product Image">
          <div class="order-item-details">
            <p><strong>${name}</strong></p>
            <p>Price: ${price}</p>
            <p>Quantity: ${quantity}</p>
            <p>Quantity: ${shippingFees}</p>

          </div>
        </div>
        <!-- Repeat for each product item -->

      </div>
      
      <div class="order-summary">
        <p><strong>Total:</strong> ${total}</p>
      </div>

      <p>We appreciate your business and hope you enjoy your purchase!</p>
      <p>Thank you, <br> Rohan Karki</p>
    </div>

    <div class="footer">
      <p>&copy; 2024 All rights reserved.</p>
      <p>Sneaker head, Inaruwa</p>
    </div>
  </div>
</body>
</html>

`