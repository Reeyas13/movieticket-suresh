import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const [transactionCode, setTransactionCode] = useState('');
  const [transactionUUID, setTransactionUUID] = useState('');

  useEffect(() => {
    const code = searchParams.get('transaction_code');
    const uuid = searchParams.get('transaction_uuid');
    setTransactionCode(code);
    setTransactionUUID(uuid);
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-4">❌ Payment Failed</h1>
      <p className="text-lg mb-2">There was a problem processing your payment.</p>
      <div className="bg-white p-4 rounded shadow-md w-full max-w-md mt-4">

      </div>
    </div>
  );
};

export default PaymentFailure;
