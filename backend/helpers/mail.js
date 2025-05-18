import crypto from "crypto";
import Mailjet from "node-mailjet";
const mail = Mailjet.apiConnect(
    "5185ebe887293c5fe808ad398884c4e0",
    "e58385ebae558a56a2c99b4da33b4b8a",
    { config: {}, options: {} }
  );
  
export const sendVerificationCode = async (verificationCode, email) => {
    try {
      
      const emailTemplate = getVerificationEmailTemplate(verificationCode);
  
      // Send email using Mailjet API
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
            Subject: "Verification Code",
            TextPart: `Your verification code is: ${verificationCode}`,
            HTMLPart: emailTemplate, // Use the generated HTML template
          },
        ],
      });
  
      // Send the email and log the result
      const result = await request;
      console.log(result);
    } catch (err) {
      console.error("Error sending email:", err.statusCode);
    }
  };
  