import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  stopOnSuccess?: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  stopOnSuccess = false,
}) => {
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    const initializeScanner = () => {
      const qrReaderElement = document.getElementById("qr-reader");

      if (!qrReaderElement) {
        console.error("QR Reader element not found in the DOM.");
        return;
      }

      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          if (stopOnSuccess && scanner) {
            scanner
              .clear()
              .then(() => {
                console.log("Scanner stopped successfully.");
              })
              .catch((err) => {
                console.error("Failed to stop scanner:", err);
              });
          }
        },
        (error) => {
          console.warn("QR scan error:", error);
        }
      );
    };

    initializeScanner();

    return () => {
      if (scanner) {
        scanner
          .clear()
          .then(() => {
            console.log("Scanner cleared on unmount.");
          })
          .catch((err) => {
            console.error("Failed to clear QR scanner on unmount:", err);
          });
      }
    };
  }, [onScanSuccess, stopOnSuccess]);

  return (
    <div>
    <div id="qr-reader" className="w-full rounded-lg overflow-hidden shadow-lg border border-gray-300">
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-sm text-muted-foreground">
            Point your camera at the QR code to scan.
          </div>
        </CardContent>
      </Card>
  </div>
  </div>
  );
};
