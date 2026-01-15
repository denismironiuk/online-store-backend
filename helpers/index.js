const EmailSender = require('../util/EmailSender');
const easyinvoice = require('easyinvoice');
const Order = require('../models/order');
const {generateInvoiceObject} = require('./invoice/generate-invoice')
exports.createOrder = async (customer, data) => {
    const items = JSON.parse(customer.metadata.cart)
    const newOrder = new Order({
      userId: customer.metadata.userId,
      paymentIntentId: data.paymentIntentId,
      products: items,
      subTotal: data.amount_subtotal,
      total: data.amount_total,
      shipping: data.customer_details,
      payment_status: data.payment_status
    })

  
    try {
      const savedOrder = await newOrder.save();
      
        const populatedOrder = await savedOrder.populate('userId')
  
      const invoiceName='invoice-'+ savedOrder._id.toString() + '.pdf'
      const invoice=generateInvoiceObject(populatedOrder.products, populatedOrder.createdAt)

       await easyinvoice.createInvoice(invoice,async(result)=>{
       if(result){
        console.log("success")
       } 
       else{  
        console.log("error")
       }
        const userEmail = customer.email;
        const pdfContent = result.pdf;
        const attachments = [{ 
          filename: invoiceName, 
          content: pdfContent,
          encoding:'base64',
          contentType: 'application/pdf'
        }];

        const emailContent = `<h1>Thank first you for your order!</h1>`
        EmailSender.sendOrderEmail(userEmail, emailContent,attachments)

       })
     }

    
    catch (error) {
      console.log('')
    }
  }