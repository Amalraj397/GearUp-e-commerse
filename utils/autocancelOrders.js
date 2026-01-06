import cron from "node-cron";
import orderSchema from "../Models/orderModel.js";
import productSchema from "../Models/productModel.js";

cron.schedule("0 * * * *", async () => {
  try {
    console.log(" Auto-cancel job running..at",new Date().toLocaleString());

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    );

    const orders = await orderSchema.find({
      paymentMethod: "Online-razorpay",
      paymentStatus: { $in: ["Failed", "Processing"] },
      createdAt: { $lte: twentyFourHoursAgo },
      orderStatus: { $ne: "Cancelled" },
    });

    for (const order of orders) {

      // RESTORE STOCK
      for (const item of order.items) {
        await productSchema.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );

        item.itemStatus = "Cancelled";
      }

      order.orderStatus = "Cancelled";
      order.paymentStatus = "Cancelled";

      await order.save();

      console.log(`Auto-cancelled order: ${order.orderNumber}`);
    }

  } catch (error) {
    console.error("Auto-cancel error:", error.message);
  }
});
