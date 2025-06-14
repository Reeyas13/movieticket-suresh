import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [transactionCode, setTransactionCode] = useState('');
  const [transactionUUID, setTransactionUUID] = useState('');

  useEffect(() => {
    const code = searchParams.get('transaction_code');
    const uuid = searchParams.get('transaction_uuid');
    setTransactionCode(code);
    setTransactionUUID(uuid);
  }, [searchParams]);
  const navigate = useNavigate();
if(transactionCode){
  setTimeout(() => {
    navigate(`/history/${transactionUUID}`);
  }, 3000);
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 Payment Successful!</h1>
      <p className="text-lg mb-2">Your transaction was completed successfully.</p>
      <div className="bg-white p-4 rounded shadow-md w-full max-w-md mt-4">
        <p><strong>Transaction Code:</strong> {transactionCode}</p>
        <p><strong>Transaction UUID:</strong> {transactionUUID}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
