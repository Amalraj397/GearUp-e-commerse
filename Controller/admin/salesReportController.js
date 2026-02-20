import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

import { fetchSalesReportData } from "../../utils/salesReport-generate.js";


function getBase64Image(filePath) {
  const file = fs.readFileSync(filePath);
  return `data:image/png;base64,${file.toString("base64")}`;
}

export const salesReportpage = async (req, res, next)=>{
    console.log(" SALES REPORT CALLED >>>>>>>>>>>>>>");
    try {
        res.status(STATUS.OK).render('salesReport.ejs');
    } catch (error) {
        console.error(MESSAGES.SalesReport.REPORT_ERR, error);
        next(error);  
    }
}

export const fetchSalesReport = async (req, res, next) => {
    console.log(" fetchSalesReport called >>>>>>>>>>>>>>");
  try {
    const { type, startDate, endDate, status } = req.query;
    const { report, summary } = await fetchSalesReportData(type, startDate, endDate, status);

    return res.json({ success: true, report, summary });
  } catch (error) {
    console.error('Sales report fetch error:', error);
    next(error);
  }
};

export const downloadSalesReportPdf = async (req, res, next) => {
  try {
    const { type, startDate, endDate, status } = req.query;
    const { report, summary } = await fetchSalesReportData(type, startDate, endDate, status);

    const logoPath = path.join(process.cwd(), "public", "User","assets","images","autominima logo-bg removed.png"); 
    const logoBase64 = getBase64Image(logoPath);
    
    const printer = new PdfPrinter({
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold"
      }
    });

    const docDefinition = {
      pageMargins: [20, 40, 20, 40],
      content: [
         {
          columns: [
            
            {
              text: "SALES REPORT",
              style: "header",
              alignment: "center",    
              // margin: [0, 0, 0, 20]
            
            }
          ]
        },
        // { text: "AUTOMINIMA SALES REPORT", style: "header" },
        { text: `Report Type: ${type.toUpperCase()}`, margin: [0, 0, 0, 10] },

        { text: "Sales Data", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Date", style: "tableHeader" },
                { text: "Order ID", style: "tableHeader" },
                { text: "Total Orders", style: "tableHeader" },
                { text: "Festival Discount", style: "tableHeader" },
                { text: "Coupon Discount", style: "tableHeader" },
                { text: "Total Discount", style: "tableHeader" },
                { text: "Revenue", style: "tableHeader" }
              ],
              ...report.map((r) => [
                r._id,
                r.orderIds.join(", "),
                r.totalOrders,
                `${r.totalFestivalDiscount}`,
                `${r.totalCouponDiscount}`,
                `${r.totalDiscount}`,
                `${r.totalRevenue}`
              ])
            ]
          },
          layout: "lightHorizontalLines"
        },

        { text: "Summary", style: "subheader", margin: [0, 20, 0, 10] },
        {
          table: {
            body: [
              ["Total Orders", summary.salesCount],
              ["Total Discount", `Rs: ${summary.totalOfferGiven}`],
              ["Total Revenue", `Rs: ${summary.orderAmount}`]
            ]
          },
          layout: "noBorders"
        },

        {
              image: logoBase64,
              width: 110,
              margin: [0, 0, 30, 50]
            },
      ],

      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 20]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0,10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fillColor: "#FF6600",
          color: "white",
          alignment: "center"
        }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="AutoMinima_Sales_Report.pdf"'
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    next(error);
  }
};

export const downloadSalesReportExcel = async (req, res, next) => {
  try {
    const { type, startDate, endDate, status } = req.query;
    const { report, summary } = await fetchSalesReportData(type, startDate, endDate, status);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sales Report');

    sheet.addRow(['AutoMinima Sales Report']).font = { bold: true, size: 16 };
    sheet.addRow([`Report Type: ${type.toUpperCase()}`]);
    sheet.addRow([]);

    // Summary
    sheet.addRow(['Summary']).font = { bold: true, size: 14 };
    sheet.addRow(['Total NO:Orders : ', summary.salesCount]);
    sheet.addRow(['Total Discount :', `Rs ${summary.totalOfferGiven}`]);
    sheet.addRow(['Total Revenue :', `Rs ${summary.orderAmount}`]);
    sheet.addRow([]);

    // Table Headers
    sheet.addRow([
      'Date',
      'Order IDs',
      'Total Orders',
      'Festival Discount',
      'Coupon Discount',
      'Total Discount',
      'Revenue',
    ]).font = { bold: true };

    // Table Data
    report.forEach((r) => {
      sheet.addRow([
        r._id,
        r.orderIds.join(', '),
        r.totalOrders,
        r.totalFestivalDiscount,
        r.totalCouponDiscount,
        r.totalDiscount,
        r.totalRevenue,
      ]);
    });

    // Auto fit columns
    sheet.columns.forEach((col) => {
      let max = 15;
      col.eachCell({ includeEmpty: true }, (cell) => {
        max = Math.max(max, cell.value ? cell.value.toString().length : 0);
      });
      col.width = max + 5;
    });

    // Headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="AutoMinima_Sales_Report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel:', error);
    next(error);
  }
};
