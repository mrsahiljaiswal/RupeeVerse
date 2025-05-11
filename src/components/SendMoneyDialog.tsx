import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayment } from '@/hooks/usePayment';

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendMoneyDialog = ({ open, onOpenChange }: SendMoneyDialogProps) => {
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [note, setNote] = useState('');
  const { processing, sendPayment } = usePayment();

  const handleSendMoney = async () => {
    const success = await sendPayment(Number(amount), payee, note);
    if (success) {
      onOpenChange(false);
      // Reset form
      setAmount('');
      setPayee('');
      setNote('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card-gradient backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Enter the recipient's username and amount to send money.
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
              disabled={processing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payee">Recipient Username</Label>
            <Input
              id="payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="bg-white/5 border-white/10"
              placeholder="Enter recipient username"
              disabled={processing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white/5 border-white/10"
              placeholder="Add a note"
              disabled={processing}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            className="border-white/10" 
            onClick={() => onOpenChange(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            className="green-gradient" 
            onClick={handleSendMoney} 
            disabled={processing}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Send Money"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoneyDialog; 