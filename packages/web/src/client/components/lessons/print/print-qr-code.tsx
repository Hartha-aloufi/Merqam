import React from "react";
import { QRCodeCanvas } from "qrcode.react";

interface PrintQRCodeProps {
  topicId: string;
  lessonId: string;
}

const PrintQRCode = ({ topicId, lessonId }: PrintQRCodeProps) => {
  // Only generate URL in browser environment
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/playlists/${topicId}/${lessonId}`
      : "";

  return (
    <div className="text-center space-y-3">
      <QRCodeCanvas value={url} size={100} level="H" includeMargin={true} />
      <p className="text-sm text-muted-foreground">
        امسح الرمز للوصول إلى النسخة الرقمية
      </p>
    </div>
  );
};

export default PrintQRCode;
