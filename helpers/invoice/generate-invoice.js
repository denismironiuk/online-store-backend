exports.generateInvoiceObject = (items, createdAt) => {
    const invoice = {
      customize: {
        // Add your customizations here
      },
      images: {
        logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
        background: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
      },
      sender: {
        company: 'Sample Corp',
        address: 'Sample Street 123',
        zip: '1234 AB',
        city: 'Sampletown',
        country: 'Samplecountry',
      },
      client: {
        company: 'Client Corp',
        address: 'Clientstreet 456',
        zip: '4567 CD',
        city: 'Clientcity',
        country: 'Clientcountry',
      },
      information: {
        number: '2021.0001',
        date: '12-12-2021',
        'due-date': '31-12-2021',
      },
      products: items.map((item) => ({
        quantity: +item.quantity,
        description: item.name,
        'tax-rate': 5,
        price: +item.price.toFixed(2),
      })),
      'bottom-notice': 'Kindly pay your invoice within 15 days.',
      settings: {
        currency: 'USD',
      },
      translate: {
        // Add translations if needed
      },
    };
  
    return invoice;
  };
  