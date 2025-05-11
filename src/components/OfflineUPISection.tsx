import React, { useState, useCallback, useEffect } from 'react';
import { Wifi, IndianRupee, ArrowRight, ArrowDownLeft, QrCode, Send, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOfflineTransactions } from '@/contexts/OfflineTransactionContext';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeScanner from './QRCodeScanner';
import { 
  AlertDialog, 
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { usePayment } from '@/hooks/usePayment';
import { usePaymentRequest } from '@/hooks/usePaymentRequest';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionHistory from './TransactionHistory';
import { debounce } from 'lodash';
import { getQueuedPayments, addPaymentToQueue, clearQueuedPayments, removeProcessedPayment } from '@/utils/localStorageUtils';

const LoadingSpinner = ({ className = "" }) => (
  <svg 
    className={`animate-spin -ml-1 mr-2 h-4 w-4 ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    ></circle>
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const OfflineUPISection = () => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [qrData, setQrData] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [requestResponse, setRequestResponse] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add a state to trigger re-render
  const [sendProcessing, setSendProcessing] = useState(false); // Add sendProcessing state
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const { sendPayment } = usePayment();
  const { processing: requestProcessing, requestPayment } = usePaymentRequest();
  const { generateQR, processPayment } = useOfflineTransactions();
  const { toast } = useToast();
  const isOnline = navigator.onLine;
  const { refetch: refetchTransactions } = useTransactions();

  // Function to generate QR code whenever relevant fields change
  const updateQRCode = useCallback(() => {
    if (amount && Number(amount) > 0) {
      try {
        const { qrData: newQrData, paymentInfo: newPaymentInfo } = generateQR(
          Number(amount),
          description || "Payment Request"
        );
        setQrData(newQrData);
        setPaymentInfo(newPaymentInfo);
      } catch (error) {
        console.error('Failed to generate QR:', error);
      }
    } else {
      setQrData('');
      setPaymentInfo(null);
    }
  }, [amount, description, generateQR]);

  // Update QR code whenever amount or description changes
  useEffect(() => {
    updateQRCode();
  }, [amount, description, updateQRCode]);

  // Function to handle offline payment
  const handleSendMoney = async () => {
    const paymentDetails = {
      amount: Number(amount),
      recipient,
      description,
      timestamp: Date.now(),
    };

    setSendProcessing(true); // Start processing
    try {
      if (!navigator.onLine) {
        // User is offline, queue the payment
        addPaymentToQueue(paymentDetails);
        toast({
          title: "Payment Queued",
          description: "Your payment will be processed when you're back online.",
          variant: "default",
        });
      } else {
        // User is online, process the payment immediately
        const success = await sendPayment(paymentDetails.amount, paymentDetails.recipient, paymentDetails.description);
        if (success) {
          toast({
            title: "Payment Successful",
            description: `Payment of ₹${paymentDetails.amount} to ${paymentDetails.recipient} has been processed.`,
            variant: "success",
          });
        } else {
          toast({
            title: "Payment Failed",
            description: "Unable to process the payment. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the payment.",
        variant: "destructive",
      });
    } finally {
      setSendProcessing(false); // End processing
      setShowSendDialog(false);
      resetForm();
    }
  };

  // Function to process queued payments when back online
  const processQueuedPayments = useCallback(async () => {
    // Prevent duplicate processing if already locked
    if (isProcessingQueue) return;

    const queuedPayments = getQueuedPayments();
    if (queuedPayments.length === 0) return;

    setIsProcessingQueue(true); // Lock the queue

    for (const payment of queuedPayments) {
      try {
        // Process the payment
        await sendPayment(payment.amount, payment.recipient, payment.description);

        // Show success toast
        toast({
          title: "Payment Processed",
          description: `Payment of ₹${payment.amount} to ${payment.recipient} has been processed.`,
          variant: "success",
        });

        // Remove the processed payment from the queue
        const updatedQueue = getQueuedPayments().filter(
          (queuedPayment) => queuedPayment.timestamp !== payment.timestamp
        );
        localStorage.setItem('offlinePaymentsQueue', JSON.stringify(updatedQueue));
      } catch (error) {
        console.error("Failed to process payment:", error);

        // Show failure toast
        toast({
          title: "Payment Failed",
          description: `Failed to process payment of ₹${payment.amount} to ${payment.recipient}.`,
          variant: "destructive",
        });

        // Stop processing further payments if one fails
        break;
      }
    }

    setIsProcessingQueue(false); // Unlock the queue
  }, [isProcessingQueue, sendPayment, toast]);

  // Listen for online status changes
  useEffect(() => {
    const handleOnline = () => {
      if (!isProcessingQueue) {
        processQueuedPayments();
      }
    };

    if (navigator.onLine) {
      processQueuedPayments();
    }

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processQueuedPayments, isProcessingQueue]);

  // Reset form fields when dialog closes
  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setDescription('');
    setQrData('');
    setPaymentInfo(null);
    setRequestResponse(null);
  };

  const handleRequestPayment = async () => {
    const response = await requestPayment(Number(amount), recipient, description);
    if (response) {
      setRequestResponse(response);
      setShowReceiveDialog(false);
      setShowConfirmation(true);
    }
  };

  const handleScanQR = async (data: string) => {
    try {
      const transaction = processPayment(data);
      setShowScannerDialog(false);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast({
        title: "Invalid QR Code",
        description: "The QR code could not be processed",
        variant: "destructive",
      });
    }
  };

  // Debounce refresh function
  const handleRefresh = debounce(() => {
    refetchTransactions();
    setRefreshKey((prev) => prev + 1);
  }, 500); // Debounce with a 500ms delay

  return (
    <section id="offline-upi-section" className="py-16 md:py-24">
      {/* Gradient Orbs */}
      <div 
        className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" 
        aria-hidden="true"
      />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                <Wifi className="h-4 w-4" /> Offline Mode
              </span>
            </div>
            
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6">
              Process UPI Payments <span className="text-primary">Without Internet</span>
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              RupeeVerse's revolutionary offline UPI system allows you to make and receive payments even when you're not connected to the internet. Transactions are securely stored and processed when connectivity is restored.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button className="green-gradient" onClick={() => {
                resetForm();
                setShowSendDialog(true);
              }}>
                Send Money <Send className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => {
                resetForm();
                setShowReceiveDialog(true);
              }}>
                Receive Payment <QrCode className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/10" onClick={() => setShowScannerDialog(true)}>
                Scan to Pay <ScanBarcode className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 relative max-w-md">
            <div className="card-gradient rounded-2xl p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-medium text-xl">Offline UPI Flow</h3>
                <div className="badge badge-purple">New</div>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start bg-white/5 rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Create Offline Transaction</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate a secure QR code even without internet
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start bg-white/5 rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-emerald/20 text-emerald flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Secure Local Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Transaction is encrypted and stored locally on device
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start bg-white/5 rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Locate Bank & ATMs</h4>
                    
                    <p className="text-sm text-muted-foreground">
                      Find the nearest bank or ATM using our map integration, perfect for rural areas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div 
                className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5 flex items-center justify-between cursor-pointer"
                onClick={() => setShowSendDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald/20 text-emerald flex items-center justify-center">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ready to try?</h4>
                    <p className="text-xs text-muted-foreground">Works even in remote areas</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 card-gradient rounded-xl p-4 flex items-center gap-3 rotate-6 shadow-lg">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald/20 text-emerald">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">Received ₹500 <span className="text-xs text-emerald">Offline</span></p>
            </div>
          </div>
        </div>

        {/* Transaction Histoy Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Transaction History</h3>
            <Button 
              variant="outline" 
              className="border-white/10"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          <TransactionHistory key={refreshKey} /> {/* Pass refreshKey as a key to force re-render */}
        </div>
      </div>

      {/* Send Money Dialog */}
      <Dialog open={showSendDialog} onOpenChange={(open) => {
        setShowSendDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="card-gradient backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Send Money Offline</DialogTitle>
            <DialogDescription>
              Your transaction will be securely stored and processed when you're back online.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Enter amount"
                disabled={sendProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Enter recipient username"
                disabled={sendProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Note (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="What is this payment for?"
                disabled={sendProcessing}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="border-white/10" 
              onClick={() => setShowSendDialog(false)} 
              disabled={sendProcessing}
            >
              Cancel
            </Button>
            <Button 
              className="green-gradient" 
              onClick={handleSendMoney} 
              disabled={sendProcessing || isProcessingQueue}
            >
              {sendProcessing || isProcessingQueue ? (
                <>
                  <LoadingSpinner />
                  Processing...
                </>
              ) : (
                "Send Money"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Money Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={(open) => {
        setShowReceiveDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="card-gradient backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Request Payment</DialogTitle>
            <DialogDescription>
              Send a payment request to another user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiveAmount">Amount (₹)</Label>
              <Input
                id="receiveAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Enter amount"
                disabled={requestProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Username</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Enter recipient username"
                disabled={requestProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Note (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="What is this payment for?"
                disabled={requestProcessing}
              />
            </div>
            
            {qrData && (
              <div className="p-4 bg-white rounded-lg flex flex-col items-center justify-center">
                <div className="text-center">
                  <QRCodeSVG 
                    value={qrData}
                    size={180}
                    level="M"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                  <p className="text-black text-xs mt-2">Scan to pay ₹{amount}</p>
                  {paymentInfo && paymentInfo.reference && (
                    <p className="text-black text-xs">Ref: {paymentInfo.reference}</p>
                  )}
                  {paymentInfo && (
                    <p className="text-black text-xs mt-1">
                      Valid for {Math.round((paymentInfo.expiry - Date.now()) / 60000)} minutes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              className="border-white/10" 
              onClick={() => {
                setShowReceiveDialog(false);
                resetForm();
              }} 
              disabled={requestProcessing}
            >
              Cancel
            </Button>
            <Button 
              className="green-gradient" 
              onClick={handleRequestPayment} 
              disabled={requestProcessing}
            >
              {requestProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Request Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* QR Scanner Dialog */}
      <Dialog open={showScannerDialog} onOpenChange={setShowScannerDialog}>
        <DialogContent className="card-gradient backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Scan to Pay</DialogTitle>
            <DialogDescription>
              Scan a QR code to make a payment.
            </DialogDescription>
          </DialogHeader>
          
          <QRCodeScanner 
            onScan={handleScanQR} 
            onCancel={() => setShowScannerDialog(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Transaction Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="card-gradient backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {requestResponse ? 'Payment Request Sent' : 'Transaction Successful'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {requestResponse ? (
                <div className="space-y-2 mt-2">
                  <p className="text-sm">{requestResponse.message}</p>
                  <div className="bg-white/5 rounded-lg p-3 space-y-1">
                    <p className="text-sm">Amount: ₹{requestResponse.data.amount}</p>
                    <p className="text-sm">Recipient: {requestResponse.data.recipient}</p>
                    <p className="text-sm">Status: {requestResponse.data.status}</p>
                    <p className="text-sm">Created: {new Date(requestResponse.data.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <>
                  Your transaction has been {isOnline ? 'processed' : 'saved offline'}.
                  {!isOnline && ' It will be synced when you are back online.'}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald/20 text-emerald flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction 
              className="green-gradient w-full" 
              onClick={() => {
                setShowConfirmation(false);
                setRequestResponse(null);
              }}
            >
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default OfflineUPISection;
