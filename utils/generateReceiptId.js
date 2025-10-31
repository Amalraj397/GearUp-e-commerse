export default function generateReceiptId() {

  const date = new Date();
  const formattedDate = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AM-REC-${formattedDate}-${randomPart}`;
  
}