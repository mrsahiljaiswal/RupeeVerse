import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Notification } from '@/services/notificationService';
import NotificationCard from './NotificationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationUpdate: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationUpdate,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      onNotificationUpdate();
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await notificationService.dismissNotification(id);
      onNotificationUpdate();
      toast({
        title: 'Success',
        description: 'Notification dismissed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss notification',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      onNotificationUpdate();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptRequest = async (transactionId: string) => {
    try {
      await notificationService.acceptRequest(transactionId);
      onNotificationUpdate();
      setSelectedNotification(null);
      toast({
        title: 'Success',
        description: 'Payment request accepted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept payment request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (transactionId: string) => {
    try {
      await notificationService.rejectRequest(transactionId);
      onNotificationUpdate();
      setSelectedNotification(null);
      toast({
        title: 'Success',
        description: 'Payment request rejected',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject payment request',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg dark-gradient border border-white/10">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="font-poppins text-xl">Recent Notifications</DialogTitle>
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="text-sm font-inter hover:bg-primary/20"
            >
              Mark All as Read
            </Button>
          </DialogHeader>
          <Separator className="my-4 bg-white/10" />
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                    onClick={(notification) => {
                      if (notification.type === 'request_sent') {
                        setSelectedNotification(notification);
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Payment Request Modal */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent className="max-w-md dark-gradient border border-white/10">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl">Payment Request</DialogTitle>
          </DialogHeader>
          <Separator className="my-4 bg-white/10" />
          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg card-gradient">
                <p className="text-sm font-inter">{selectedNotification.message}</p>
                <p className="text-xs text-muted-foreground mt-2 font-inter">
                  Transaction ID: {selectedNotification.transactionId}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 green-gradient font-inter"
                  onClick={() => handleAcceptRequest(selectedNotification.transactionId!)}
                >
                  Accept
                </Button>
                <Button
                  className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 font-inter"
                  onClick={() => handleRejectRequest(selectedNotification.transactionId!)}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationPopup; 