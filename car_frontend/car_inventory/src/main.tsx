import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.css";  // Bootstrap CSS import
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import { UserProvider } from "./UserContext"; // Import UserProvider for managing user state

// ReactDOM renders the app inside the root element of the HTML document
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* BrowserRouter is wrapping the entire app to enable routing */}
    <BrowserRouter>
      {/* UserProvider wraps App to provide user state globally */}
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
