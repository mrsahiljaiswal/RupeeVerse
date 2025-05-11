export const getQueuedPayments = () => {
  const payments = localStorage.getItem('offlinePaymentsQueue');
  return payments ? JSON.parse(payments) : [];
};

export const addPaymentToQueue = (payment) => {
  const payments = getQueuedPayments();
  payments.push(payment);
  localStorage.setItem('offlinePaymentsQueue', JSON.stringify(payments));
};

export const clearQueuedPayments = () => {
  localStorage.removeItem('offlinePaymentsQueue');
};

export const removeProcessedPayment = (index) => {
  const payments = getQueuedPayments();
  payments.splice(index, 1);
  localStorage.setItem('offlinePaymentsQueue', JSON.stringify(payments));
};