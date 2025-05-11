
import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type QRScannerProps = {
  onScan: (data: string) => void;
  onCancel: () => void;
};

const QRCodeScanner: React.FC<QRScannerProps> = ({ onScan, onCancel }) => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startScanning = async () => {
    setScanning(true);
    setCameraError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanQRCode);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setCameraError('Could not access camera. Please check permissions and try again.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanning) {
        stopScanning();
      }
    };
  }, [scanning]);

  // Mock QR code scanning (in a real app, use a proper QR scanning library)
  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // In a real app, here we would use a QR code detection library to scan the canvas
      // Like jsQR or a similar library. For demo purposes, we simulate finding a QR code
      // after a short delay
      setTimeout(() => {
        // Simulate finding a QR code
        const mockQRData = `UPI://PAY?pa=rupeeverse@upi&pn=RupeeVerse&am=100&tn=${encodeURIComponent('Test Payment')}&tr=ABCD1234&cu=INR&expiry=${Date.now() + 900000}`;
        
        stopScanning();
        toast({
          title: "QR Code Detected",
          description: "Payment information extracted successfully"
        });
        onScan(mockQRData);
      }, 3000);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Manual entry for testing
  const handleManualEntry = () => {
    const mockQRData = `UPI://PAY?pa=rupeeverse@upi&pn=RupeeVerse&am=100&tn=${encodeURIComponent('Test Payment')}&tr=ABCD1234&cu=INR&expiry=${Date.now() + 900000}`;
    onScan(mockQRData);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 overflow-hidden rounded-lg bg-black">
        {scanning ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full max-h-72 object-cover"
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-primary w-48 h-48 rounded-lg opacity-70"></div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              Position QR code in the frame
            </div>
          </>
        ) : (
          <div className="w-full h-64 bg-secondary/50 flex flex-col items-center justify-center">
            <QrCode size={64} className="mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="mb-4 p-2 bg-destructive/20 text-destructive rounded text-sm">
          {cameraError}
        </div>
      )}

      <div className="flex gap-4">
        {!scanning ? (
          <Button onClick={startScanning} className="green-gradient">
            <ScanBarcode className="mr-2 h-4 w-4" /> Scan QR Code
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopScanning}>
            Cancel Scan
          </Button>
        )}
        
        <Button variant="outline" onClick={handleManualEntry} className="border-white/10">
          Manual Test
        </Button>
        
        <Button variant="ghost" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
