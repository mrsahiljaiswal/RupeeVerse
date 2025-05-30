import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification } from '@/services/notificationService';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick: (notification: Notification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDismiss,
  onClick,
}) => {
  const extractAmount = (message: string) => {
    const match = message.match(/₹(\d+)/);
    return match ? match[1] : '';
  };

  const extractName = (message: string) => {
    const match = message.match(/from\s+([^\s]+)/);
    return match ? match[1] : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card 
        className={cn(
          "p-4 transition-all duration-200 cursor-pointer border-0",
          notification.seen
            ? "bg-black/30 text-gray-400"
            : "bg-black text-white"
        )}
        onClick={() => onClick(notification)}
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm font-medium font-poppins",
                  notification.seen ? "text-gray-400" : "text-white"
                )}>
                  {notification.type === 'request_sent' ? 'Payment Request' : 'Transaction Update'}
                </p>
                {!notification.seen && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    New
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-xs font-inter",
                notification.seen ? "text-gray-500" : "text-gray-300"
              )}>
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-lg font-bold font-poppins",
                notification.seen ? "text-gray-400" : "text-white"
              )}>
                ₹{extractAmount(notification.message)}
              </p>
              <p className={cn(
                "text-sm font-inter",
                notification.seen ? "text-gray-500" : "text-gray-300"
              )}>
                {extractName(notification.message)}
              </p>
            </div>
          </div>

          <p className={cn(
            "text-sm font-inter",
            notification.seen ? "text-gray-500" : "text-gray-300"
          )}>
            {notification.message}
          </p>

          <div className="flex gap-2 mt-2">
            {!notification.seen && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}
                className="flex-1 font-inter"
              >
                Mark as Read
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification._id);
              }}
              className={cn("font-inter", notification.seen ? "w-full" : "flex-1")}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NotificationCard; 