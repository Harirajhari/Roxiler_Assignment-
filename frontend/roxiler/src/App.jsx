import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Dropdown from './components/dropdown';
import BarChart from './components/BarChart';
import Statistics from './components/Statistics';
import YearDropdown from './components/YearDropdown';
import PieChart from './components/Peichart'; 

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        if (selectedMonth === 'All') {
          response = await axios.get('http://localhost:3030/transactions', {
            params: { page, perPage, search: searchQuery }
          });
        } else {
          response = await axios.get('http://localhost:3030/productsByMonth', {
            params: { month: selectedMonth , year:selectedYear }
          });
        }
        setProducts(response.data.products || response.data);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        setError('Error fetching products');
        console.error(err);
      }
    };

    fetchProducts();
  }, [page, perPage, selectedMonth, searchQuery,selectedYear]);



  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        if (selectedMonth !== 'All') {
          console.log(`Fetching bar chart data for month: ${selectedMonth}, year: ${selectedYear}`);
          const response = await axios.get('http://localhost:3030/barchart', {
            params: { month: selectedMonth, year: selectedYear }
          });

          console.log('Response from server:', response.data);

          // Extract the data array from the response
          const data = response.data[selectedYear]; // assuming the data is under the selected year key

          // Transform data into the expected format for chartData
          const formattedData = data.map(entry => ({
            range: entry.range,
            count: entry.count
          }));

          if (!Array.isArray(formattedData) || formattedData.length === 0) {
            throw new Error('Invalid data format received from server');
          }

          const chartData = {
            labels: formattedData.map(entry => entry.range),
            datasets: [
              {
                label: `${selectedMonth} ${selectedYear}`,
                data: formattedData.map(entry => entry.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
              }
            ]
          };

          setChartData(chartData);
        }
      } catch (err) {
        console.error('Error fetching bar chart data:', err);
        setChartData(null); // Reset chart data on error
      }
    };

    fetchBarChartData();
  }, [selectedMonth, selectedYear]);

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1); // Reset to the first page when the month changes
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1); // Reset to the first page when the year changes
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when search query changes
  };

  return (
    <div className="container">
      <h1 className='transaction'>Transaction Dashboard</h1>
      <Dropdown selectedMonth={selectedMonth} handleMonthChange={handleMonthChange} />
      <YearDropdown selectedYear={selectedYear} handleYearChange={handleYearChange} />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search products..."
        className="search-input"
      />
      {error && <p>{error}</p>}
      {products.length === 0 ? (
        <p>No products available</p>
      ) : (
        <div>
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sold</th>
                <th>Date of Sale</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td><img src={product.image} alt={product.title} width="100" /></td>
                  <td>{product.title}</td>
                  <td>{product.description}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.sold ? 'Yes' : 'No'}</td>
                  <td>{new Date(product.dateOfSale).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
      <div>
      {selectedMonth !== 'All' && <Statistics selectedMonth={selectedMonth} selectedYear={selectedYear} />}
        {chartData ? <BarChart chartData={chartData} /> : <p>There is not product on this year....</p>}
         {selectedMonth !== 'All' && <PieChart selectedMonth={selectedMonth} selectedYear={selectedYear} />}
      </div>
    </div>
  );
}

export default App;
