const express = require('express');
const axios = require('axios');
const Product = require('../Schema/Product');
const router = express.Router();

router.get('/seed', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const products = response.data;

    await Product.deleteMany();

    await Product.insertMany(products);

    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error seeding database', error });
  }
});

//For the testing all dat geting correctly or not
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});


//seprate the data by the month
router.get('/productsByMonth', async (req, res) => {
  try {

    //sending the dat frontend to backend by the query
    const { month, year } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month query parameter is required' });
    }

    //choose tha month in frontend and get by the req.query
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthIndex = monthNames.indexOf(month);

    if (monthIndex === -1) {
      return res.status(400).json({ message: 'Invalid month provided' });
    }


    //aggregate the data from the db data by the spectific month
    const pipeline = [
      {
        $addFields: {
          month: { $month: '$dateOfSale' },
          year: { $year: '$dateOfSale' }
        }
      },
      {
        $match: {
          month: monthIndex + 1
        }
      }
    ];

    // Add year filter if year is specified
    if (year) {
      pipeline.push({
        $match: {
          year: parseInt(year)
        }
      });
    }

    const products = await Product.aggregate(pipeline);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products by month', error });
  }
});


//When the month should be the All, then only we can search
router.get('/transactions', async (req, res) => {
  try {
    const { search, page = 1, perPage = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: parseFloat(search) || 0 }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));


    res.status(200).json({
      page: parseInt(page),
      perPage: parseInt(perPage),
      total,
      totalPages: Math.ceil(total / perPage),
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
});

// Route to get statistics for a selected month and year
router.get('/statistics', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year parameters are required' });
    }

    const monthIndex = getMonthIndex(month);
    if (monthIndex === -1) {
      return res.status(400).json({ message: 'Invalid month parameter' });
    }


    const transactions = await Product.aggregate([
      {
        $addFields: {
          month: { $month: '$dateOfSale' },
          year: { $year: '$dateOfSale' }
        }
      },
      {
        $match: {
          month: monthIndex + 1,
          year: parseInt(year)
        }
      }
    ]);

    // Calculate statistics
    let totalSaleAmount = 0;
    let totalSoldItems = 0;
    let totalNotSoldItems = 0;

    transactions.forEach(transaction => {
      if (transaction.sold) {
        totalSaleAmount += transaction.price;
        totalSoldItems += 1;
      } else {
        totalNotSoldItems += 1;
      }
    });


    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching statistics', error });
  }
});



function getMonthIndex(monthName) {
  return new Date(`${monthName} 1, 2022`).getMonth();
}

// Route to fetch bar chart data for a specific month and year
router.get('/barchart', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year || isNaN(year)) {
      return res.status(400).json({ error: 'Invalid month or year parameter' });
    }

    const monthIndex = getMonthIndex(month);
    const yearList = year.split(',').map(Number);

    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity }
    ];

    const transactions = await Product.aggregate([
      {
        $addFields: {
          month: { $month: '$dateOfSale' },
          year: { $year: '$dateOfSale' }
        }
      },
      {
        $match: {
          month: monthIndex + 1,
          year: { $in: yearList }
        }
      },
      {
        $group: {
          _id: {
            year: '$year',
            price: '$price'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          price: '$_id.price',
          count: 1
        }
      }
    ]);

    const result = {};

    transactions.forEach(transaction => {
      if (!result[transaction.year]) {
        result[transaction.year] = priceRanges.map(range => ({
          range: range.range,
          count: 0
        }));
      }

      for (let range of result[transaction.year]) {
        const { min, max } = priceRanges.find(r => r.range === range.range);
        if (transaction.price >= min && transaction.price <= max) {
          range.count += transaction.count;
          break;
        }
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bar chart data', error });
  }
});



router.get('/piechart', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year parameters are required' });
    }

    const monthIndex = getMonthIndex(month);
    if (monthIndex === -1) {
      return res.status(400).json({ message: 'Invalid month parameter' });
    }

    // Query to aggregate the number of items in each category for the selected month and year
    const categories = await Product.aggregate([
      {
        $addFields: {
          month: { $month: '$dateOfSale' },
          year: { $year: '$dateOfSale' }
        }
      },
      {
        $match: {
          month: monthIndex + 1,
          year: parseInt(year) 
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pie chart data', error });
  }
});


module.exports = router;




//http://localhost:3030/seed

// http://localhost:3030/products


//http://localhost:3030/productsByMonth?month=June&year=2022


// http://localhost:3030/transactions

// http://localhost:3000/api/transactions?search=shirt


// http://localhost:3030/statistics?month=January

// http://localhost:3030/barchart?month=January
