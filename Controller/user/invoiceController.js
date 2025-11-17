
import orderSchema from "../../Models/orderModel.js";
import PDFDocument from "pdfkit";
import path from "path";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";


function numberToWords(num) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if ((num = num.toString()).length > 9) return "Overflow";
  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = "";
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
      : "";
  return str.trim();
}

export const downloadInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema.findById(orderId).populate("items.productId");

    if (!order) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.Orders.NO_ORDER });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );
    doc.pipe(res);

    /* ---------- HEADER ---------- */
    const logoPath = path.join(
      process.cwd(),
      "Public",
      "User",
      "assets",
      "images",
      "icons",
      "autominima-logo.png"
    );

    doc.image(logoPath, 50, 40, { width: 140 });
    doc
      .fontSize(20)
      .fillColor("black")
      .text("Tax Invoice / Bill of Supply / Cash Memo", 0, 50, { align: "right" })
      .fontSize(10)
      .text("(Original for Recipient)", { align: "right" });

    doc.moveTo(50, 110).lineTo(550, 110).stroke("#fa8f0b");

    /* ---------- SELLER DETAILS ---------- */
    doc.moveDown(3);
    doc.font("Helvetica-Bold").fontSize(11).text("Sold By:", 50);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text("AutoMinima Retail Pvt. Ltd.")
      .text("Bangalore, Karnataka, 560035, IN")
      .moveDown(0.5)
      .text("PAN No: AAAAA9999A")
      .text("GST Registration No: 29ABCDE1234F1Z5");

    /* ---------- ORDER DETAILS ---------- */
    const topY = 180;
    doc.font("Helvetica-Bold").fontSize(11).text("Order Details:", 300, topY);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Order Number: ${order.orderNumber}`, 300, topY + 15)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 300, topY + 30)
      .text(`Invoice Number: INV-${order._id.toString().slice(-6)}`, 300, topY + 45)
      .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 300, topY + 60)
      .text(`Payment Method: ${order.paymentMethod}`, 300, topY + 75);

    /* ---------- BILLING / SHIPPING ---------- */
    const b = order.billingDetails;
    doc.moveDown(2);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Billing Address:", 50, 260)
      .font("Helvetica")
      .fontSize(10)
      .text(`${b.name}`)
      .text(`${b.address}, ${b.city}`)
      .text(`${b.state}, ${b.country}`)
      .text(`Pincode: ${b.pincode}`)
      .text(`Phone: ${b.phone}`)
      .text(`Email: ${b.email}`);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Shipping Address:", 300, 260)
      .font("Helvetica")
      .fontSize(10)
      .text(`${b.name}`)
      .text(`${b.address}, ${b.city}`)
      .text(`${b.state}, ${b.country}`)
      .text(`Pincode: ${b.pincode}`)
      .text(`Phone: ${b.phone}`)
      .text(`Email: ${b.email}`);

    doc.moveTo(50, 370).lineTo(550, 370).stroke("#fa8f0b");

    /* ---------- ITEMS TABLE ---------- */
    const tableTop = 390;
    const itemX = 50;
    const tableWidth = 500;
    const colWidths = [200, 80, 50, 80, 90];

    // Header row
    doc.rect(itemX, tableTop, tableWidth, 20).fill("#fa8f0b");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(10);
    doc.text("Description", itemX + 5, tableTop + 5, { width: colWidths[0] });
    doc.text("Variant", itemX + colWidths[0] + 5, tableTop + 5, { width: colWidths[1] });
    doc.text("Qty", itemX + colWidths[0] + colWidths[1] + 5, tableTop + 5, { width: colWidths[2] });
    doc.text("Unit Price", itemX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 5, {
      width: colWidths[3],
    });
    doc.text("Total", itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, tableTop + 5, {
      width: colWidths[4],
    });

    doc.font("Helvetica").fillColor("black").fontSize(10);

    let y = tableTop + 25;
    order.items.forEach((item, idx) => {
      const product = item.productId || {};
      const bg = idx % 2 === 0 ? "#f9f9f9" : "#ffffff";
      doc.rect(itemX, y - 5, tableWidth, 25).fill(bg).stroke("#dddddd");

      let x = itemX + 5;
      doc.fillColor("black").text(product.productName || "Unknown", x, y, { width: colWidths[0] });
      x += colWidths[0];
      doc.text(item.variantName || "-", x, y, { width: colWidths[1] });
      x += colWidths[1];
      doc.text(item.quantity.toString(), x, y, { width: colWidths[2] });
      x += colWidths[2];
      doc.text(`Rs. ${item.salePrice.toFixed(2)}`, x, y, { width: colWidths[3] });
      x += colWidths[3];
      doc.text(`Rs. ${item.totalProductprice.toFixed(2)}`, x, y, { width: colWidths[4] });

      y += 25;
    });

    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke("#fa8f0b");

    /* ---------- TOTALS ---------- */
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(`Subtotal: Rs. ${order.grandTotalprice.toFixed(2)}`, 350, y + 20)
      .font("Helvetica")
      .text(`Shipping: Rs. ${order.shippingCharge.toFixed(2)}`, 350, y + 35)
      .text(`Tax: Rs. 0.00`, 350, y + 50);

    // Highlighted final total
    const finalY = y + 70;
    doc.rect(320, finalY, 200, 25).fill("#fa8f0b");
    doc.fillColor("white").font("Helvetica-Bold").text(
      `Grand Total: Rs. ${order.grandTotalprice.toFixed(2)}`,
      335,
      finalY + 7
    );

    /* ---------- AMOUNT IN WORDS ---------- */
    doc.moveDown(2).fillColor("black").font("Helvetica-Bold").text("Amount in Words:", 50);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`${numberToWords(order.grandTotalprice)} only`, 160);

    /* ---------- FOOTER ---------- */
    const pageHeight = doc.page.height;
    doc.rect(0, pageHeight - 25, doc.page.width, 25).fill("#fa8f0b");
    doc
      .fillColor("white")
      .fontSize(10)
      .text("Thank you for shopping with AutoMinima!", 0, pageHeight - 20, {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.log(MESSAGES.System.INVOICE_EROR, err);
    next(err);
  }
};
