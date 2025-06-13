import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";

const AveragePrice: React.FC = () => {
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the token from localStorage (or wherever it's stored)
    const token = localStorage.getItem('authToken');
    
    // If the token is available, include it in the request headers
    axiosInstance
      .get("/api/cars/average-price/", {
        headers: {
          Authorization: `Token ${token}`, // Include the token here
        },
      })
      .then((res) => {
        if (res.data.average_price) {
          setAvgPrice(res.data.average_price);
          setError(null);  // Clear any previous error
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setError("No cars available");
        } else {
          setError("An error occurred while fetching data.");
        }
        setAvgPrice(null);  // Clear average price on error
      });
  }, []);

  return (
    <div>
      <h2>Average Car Price</h2>
      {error ? (
        <p>{error}</p>
      ) : avgPrice !== null ? (
        <p>₹{avgPrice}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AveragePrice;
