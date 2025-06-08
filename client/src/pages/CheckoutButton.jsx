import { useEffect, useState } from "react";
import api from "../axios";


function CheckoutButton({orderId}) {
  const [orders, setOrders] = useState([]);

  const handlePayment = async (payment_method) => {
    // const url = "http://localhost:5001/api/payment/initiate";
    const data = {
      amount: 100,
      orderId: orderId,
      // products: [{ product: "test", amount: 100, quantity: 1 }],
      // payment_method,
    };

    try {
      const response = await api.post("/api/payment/initiate", data);
      console.log({ response })
      if (response.data.success) {
        const responseData = response.data

        if (responseData.payment_method === "esewa") {
          esewaCall(responseData.formData);
        } else if (responseData.payment_method === "khalti") {
          khaltiCall(responseData.data);
        }
      } else {
        console.error("Failed to fetch:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const khaltiCall = (data) => {
    window.location.href = data.payment_url;
  };

   const  esewaCall = (formData) => {
    console.log(formData);
    const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (const key in formData) {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (

    // <div className="flex justify-center my-4">
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mx-2 hover:bg-green-600"
        onClick={() => handlePayment("esewa")}
      >
        pay with Esewa 
      </button>

    // </div>

  );
}

export default CheckoutButton;
