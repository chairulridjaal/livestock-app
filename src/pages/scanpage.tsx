import { QRScanner } from "@/components/QRScanner";
import { useNavigate } from "react-router-dom";

export default function ScanPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Scan Livestock QR</h1>
      <QRScanner
        onScanSuccess={(id) => {
          console.log("Scanned ID:", id);
          navigate(`/livestock/view/${id}`);
        }}
      />
    </div>
  );
}
