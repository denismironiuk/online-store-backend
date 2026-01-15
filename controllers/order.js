
const { generateInvoiceObject } = require('../helpers/invoice/generate-invoice');
const Order = require('../models/order');

const jwt = require('jsonwebtoken');


const getUserOrders = async (req, res, next) => {


  try {
    // Find all orders for the specified user
    const userId = req.userId
    const orders = await Order.find({ userId: userId });

    if (!orders) {
      const error = new Error('No orders found for the specified user');
      error.statusCode = 401;
      throw error;

    }
    console.log(orders)
    res.status(200).json({
      orders
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);

  }
}

const getSingleOrderPdf = async (req, res, next) => {
  const orderId = req.params.orderId;
  console.log('dc dcd')
  try {
    const order = await Order.findById(orderId);
    const invoice = generateInvoiceObject(order.products);
    
    easyinvoice.createInvoice(invoice, (result) => {
      const pdfContent = result.pdf;
      const fileName = `invoice-${orderId}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(Buffer.from(pdfContent, 'base64'));
    });
  } catch (error) {
    // Handle error
    console.log(error);
    res.status(500).send('An error occurred');
  }
};
const getSingleInvoice =async(req,res,next)=>{
  const orderId = req.params.orderId;

  try{
    const order = await Order.findById(orderId);
    if(!order){
      res.status(404).json({message:"Order not found"})
    }
    res.status(200).json(order)
  }
  catch(err){
    console.log(err);
    res.status(500).send('An error occurred');
  }
}
module.exports = {
  getUserOrders,getSingleOrderPdf,getSingleInvoice
};
