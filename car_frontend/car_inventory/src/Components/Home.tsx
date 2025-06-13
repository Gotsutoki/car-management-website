import React, { useContext, useEffect, useState, useRef } from "react";
import axiosInstance from "./axiosInstance";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { initializeImageZoom } from './imageZoom'; 


interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  stock: number;
}

// Define a type for our local car image mapping
interface CarImageMap {
  [carId: number]: string[];  // Now an array of strings for multiple images
}

const STORAGE_KEY = "carImagesData"; // Consistent key for localStorage

const Home: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [showNavbar, setShowNavbar] = useState(true);

  // Store car image mappings
  const [carImages, setCarImages] = useState<CarImageMap>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // For image gallery popup
  const [showGallery, setShowGallery] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // For booking functionality
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [bookingCar, setBookingCar] = useState<Car | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    message: ""
  });

  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    stock: "",
    tempImages: ["", "", ""], // Three image slots
  });

  const [editCar, setEditCar] = useState<Car & { tempImages?: string[] } | null>(null);
  const prevScrollY = useRef(0);

  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const isCustomer = !isAdmin && !isStaff; // Regular customer
  
  useEffect(() => {
    initializeImageZoom();
  }, []);
  
  // Helper function to safely load data from localStorage
  const loadImagesFromStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("Loaded car images from storage:", parsedData);
        return parsedData;
      }
    } catch (e) {
      console.error("Error loading car images from storage:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
    return {};
  };
  
  // Helper function to safely save data to localStorage
  const saveImagesToStorage = (data: CarImageMap) => {
    try {
      console.log("Saving car images to storage:", data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving car images to storage:", e);
    }
  };
  
  // Initialize - First load image data from localStorage, then fetch cars
  useEffect(() => {
    const savedImages = loadImagesFromStorage();
    setCarImages(savedImages);
    // Mark as loaded so we know initialization is complete
    setIsLoaded(true);
  }, []);
  
  // Fetch cars after image data is loaded
  useEffect(() => {
    if (isLoaded) {
      fetchCars();
    }
  }, [isLoaded]);

  // Save car image mappings to localStorage whenever they change
  useEffect(() => {
    // Only save if it's not the initial load
    if (isLoaded) {
      saveImagesToStorage(carImages);
    }
  }, [carImages, isLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current + 10) {
        setShowNavbar(false);
      } else if (currentScrollY < prevScrollY.current - 10) {
        setShowNavbar(true);
      }
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close gallery on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (showGallery || showBookingModal)) {
        setShowGallery(false);
        setShowBookingModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, showBookingModal]);

  const fetchCars = async () => {
    try {
      const response = await axiosInstance.get("/cars/");
      const data = response.data;

      if (Array.isArray(data)) {
        setCars(data);
      } else if (data.results) {
        let allCars: Car[] = [...data.results];
        let nextUrl = data.next;
        while (nextUrl) {
          const res = await axiosInstance.get(nextUrl);
          allCars = [...allCars, ...res.data.results];
          nextUrl = res.data.next;
        }
        setCars(allCars);
      } else {
        console.warn("Unexpected car data format:", data);
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Booking functionality
  const handleBookAppointment = (car: Car) => {
    setBookingCar(car);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = () => {
    // Simulate booking submission (frontend only)
    setShowBookingModal(false);
    setShowBookingConfirmation(true);
    
    // Reset form
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      message: ""
    });

    // Auto-close confirmation after 5 seconds
    setTimeout(() => {
      setShowBookingConfirmation(false);
      setBookingCar(null);
    }, 5000);
  };

  const isBookingFormValid = () => {
    return bookingForm.name.trim() !== "" && 
           bookingForm.email.trim() !== "" && 
           bookingForm.phone.trim() !== "" &&
           bookingForm.preferredDate !== "";
  };

  const handleAddCar = async () => {
    try {
      // Prepare payload WITHOUT image field
      const payload = {
        brand: newCar.brand,
        model: newCar.model,
        year: parseInt(newCar.year),
        price: parseFloat(newCar.price),
        stock: parseInt(newCar.stock),
      };

      // Send to backend
      const response = await axiosInstance.post("/cars/", payload);
      const newCarData = response.data;
      
      // If we have a new car with ID and specified images, save the image mapping
      if (newCarData.id) {
        // Filter out empty image entries
        const validImages = newCar.tempImages.filter(img => img.trim() !== "");
        
        if (validImages.length > 0) {
          // Create a new object to avoid reference issues
          const updatedImages = {
            ...carImages,
            [newCarData.id]: validImages
          };
          
          // Update state with new object
          setCarImages(updatedImages);
          
          // Directly save to localStorage
          saveImagesToStorage(updatedImages);
        }
      }
      
      setShowAddModal(false);
      setNewCar({
        brand: "",
        model: "",
        year: "",
        price: "",
        stock: "",
        tempImages: ["", "", ""]
      });
      fetchCars();
    } catch (error) {
      console.error("Error adding car:", error);
      alert("Failed to add car. Please check inputs.");
    }
  };

  const handleDeleteCar = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        await axiosInstance.delete(`/cars/${id}/`);
        
        // Create a new object without the deleted car's images
        const updatedImages = {...carImages};
        delete updatedImages[id];
        
        // Update state
        setCarImages(updatedImages);
        
        // Directly save to localStorage
        saveImagesToStorage(updatedImages);
        
        setCars((prev) => prev.filter((car) => car.id !== id));
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Could not delete the car.");
      }
    }
  };

  const handleEditCarClick = (car: Car) => {
    // When clicking edit, include any existing image mapping
    setEditCar({
      ...car,
      tempImages: carImages[car.id] || ["", "", ""]
    });
    setShowEditModal(true);
  };

  const handleUpdateCar = async () => {
    if (!editCar) return;
    try {
      // Extract tempImages before sending to backend
      const { tempImages, ...carData } = editCar;
      
      await axiosInstance.put(`/cars/${editCar.id}/`, {
        ...carData,
        year: Number(editCar.year),
        price: Number(editCar.price),
        stock: Number(editCar.stock),
      });
      
      // Update image mapping if tempImages are provided
      if (tempImages) {
        // Filter out empty image entries
        const validImages = tempImages.filter(img => img && img.trim() !== "");
        
        // Create a new object to avoid reference issues
        const updatedImages = {...carImages};
        
        if (validImages.length > 0) {
          updatedImages[editCar.id] = validImages;
        } else {
          // If all images were removed, remove the entry entirely
          delete updatedImages[editCar.id];
        }
        
        // Update state
        setCarImages(updatedImages);
        
        // Directly save to localStorage
        saveImagesToStorage(updatedImages);
      }
      
      setShowEditModal(false);
      setEditCar(null);
      fetchCars();
    } catch (error) {
      console.error("Error updating car:", error);
      alert("Failed to update car.");
    }
  };

  // Function to get the primary image URL based on car ID
  const getCarImageUrl = (carId: number) => {
    const images = carImages[carId];
    
    if (!images || images.length === 0 || !images[0]) {
      return '/default.jpeg'; // Default image path
    }
    
    // Ensure the image path starts with a slash
    if (!images[0].startsWith('/')) {
      return `/${images[0]}`;
    }
    
    return images[0];
  };

  // Function to get all car images
  const getCarImages = (carId: number) => {
    const images = carImages[carId];
    
    if (!images || images.length === 0) {
      return ['/default.jpeg']; // Default image path
    }
    
    // Ensure all image paths start with a slash
    return images.map(img => !img.startsWith('/') ? `/${img}` : img);
  };

  // Handle clicking on a car card to open gallery
  const handleCarClick = (car: Car) => {
    setSelectedCar(car);
    setCurrentImageIndex(0);
    setShowGallery(true);
  };

  // Function to handle image navigation in gallery
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (!selectedCar) return;
    
    const images = getCarImages(selectedCar.id);
    
    if (direction === 'next') {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
  };

  const filteredCars = cars.filter((car) => {
    // Apply model filter
    const modelMatches = car.model.toLowerCase().includes(search.toLowerCase());
    
    // Apply brand filter
    const brandMatches = car.brand.toLowerCase().includes(brandFilter.toLowerCase());
    
    // Apply year filter
    const yearMatches = car.year.toString().includes(yearFilter);
    
    // Apply price range filters
    const minPriceMatches = minPriceFilter === "" || car.price >= parseFloat(minPriceFilter);
    const maxPriceMatches = maxPriceFilter === "" || car.price <= parseFloat(maxPriceFilter);
    
    // Return cars that match all the applied filters
    return modelMatches && brandMatches && yearMatches && minPriceMatches && maxPriceMatches;
  });

  // Handle image input change for new car
  const handleImageInputChange = (index: number, value: string) => {
    const newImages = [...newCar.tempImages];
    newImages[index] = value;
    setNewCar(prev => ({ ...prev, tempImages: newImages }));
  };

  // Handle image input change for edit car
  const handleEditImageInputChange = (index: number, value: string) => {
    if (!editCar || !editCar.tempImages) return;
    
    const newImages = [...editCar.tempImages];
    while (newImages.length < 3) {
      newImages.push("");
    }
    
    newImages[index] = value;
    setEditCar(prev => ({ ...prev!, tempImages: newImages }));
  };

  // Function to scroll to contact section
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setBrandFilter("");
    setYearFilter("");
    setMinPriceFilter("");
    setMaxPriceFilter("");
  };

  return (
    <div className="home-container">
      <div className={`navbar ${showNavbar ? "" : "hidden"}`}>
        <a href="/" className="logo" style={{ fontFamily: "'Cinzel', serif", fontSize: "1.9rem", letterSpacing: "1px" }}>
          S&A Motors
        </a>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/expensive")}>Luxury Collection</button>
          {(isAdmin || isStaff) && (
            <>
              <button className="nav-link" onClick={() => navigate("/sales")}>Sales</button>
              <button className="nav-link" onClick={() => navigate("/statistics")}>Analytics</button>
              <button className="nav-link" onClick={() => navigate("/low-stock")}>Inventory</button>
            </>
          )}
          {isAdmin && (
            <button className="nav-link" onClick={() => navigate("/customers")}>Customers</button>
          )}
          <button className="nav-link" onClick={scrollToContact}>Contact</button>
          <button className="nav-link logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="landing-section">
        <div className="overlay">
          <h1 className="heading">Luxury & Performance</h1>
          <p className="subheading">Discover the finest collection of rare automobiles</p>
          <button className="cta-btn" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
            Explore Collection
          </button>
        </div>

        {(isAdmin || isStaff) && (
          <button className="add-car-btn" onClick={() => setShowAddModal(true)}>Add Car</button>
        )}
      </div>

      <div className="filters">
        <input className="filter-input" placeholder="Search by model..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input className="filter-input" placeholder="Filter by brand..." value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} />
        <input className="filter-input" placeholder="Filter by year..." value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} />
        <div className="price-filter-group">
          <input 
            className="filter-input price-input" 
            type="number" 
            placeholder="Min price..." 
            value={minPriceFilter} 
            onChange={(e) => setMinPriceFilter(e.target.value)} 
          />
          <span className="price-separator">-</span>
          <input 
            className="filter-input price-input" 
            type="number" 
            placeholder="Max price..." 
            value={maxPriceFilter} 
            onChange={(e) => setMaxPriceFilter(e.target.value)} 
          />
        </div>
        <button className="clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="car-cards">
        {filteredCars.map((car) => (
          <div key={car.id} className="car-card">
            <div className="car-image-container" onClick={() => handleCarClick(car)}>
              <img
                src={getCarImageUrl(car.id)}
                alt={`${car.brand} ${car.model}`}
                className="car-image"
                onError={(e) => {
                  // If image fails to load, use default image
                  (e.target as HTMLImageElement).src = '/default.jpeg';
                }}
              />
              <div className="view-gallery-overlay">
                <span>Click to view gallery</span>
              </div>
            </div>
            <div className="card-body">
              <h5 className="card-title">{car.brand} {car.model}</h5>
              <p className="card-text">Year: {car.year}</p>
              <p className="card-text">Stock: {car.stock}</p>
              <p className="card-price">₹ {car.price.toLocaleString()}</p>
              
              <div className="card-actions">
                {/* Customer booking button */}
                {isCustomer && (
                  <button 
                    className="book-appointment-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleBookAppointment(car); 
                    }}
                  >
                    Book Appointment
                  </button>
                )}
                
                {/* Admin actions */}
                {isAdmin && (
                  <>
                    <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleEditCarClick(car); }}>Edit</button>
                    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteCar(car.id); }}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && bookingCar && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h2>Book Appointment</h2>
              <button className="booking-close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            
            <div className="booking-car-info">
              <img 
                src={getCarImageUrl(bookingCar.id)} 
                alt={`${bookingCar.brand} ${bookingCar.model}`}
                className="booking-car-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default.jpeg';
                }}
              />
              <div className="booking-car-details">
                <h3>{bookingCar.brand} {bookingCar.model}</h3>
                <p>Year: {bookingCar.year}</p>
                <p className="booking-car-price">₹ {bookingCar.price.toLocaleString()}</p>
              </div>
            </div>
            
            <form className="booking-form" onSubmit={(e) => { e.preventDefault(); handleBookingSubmit(); }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="form-group">
                <label>Preferred Visit Date *</label>
                <input
                  type="date"
                  value={bookingForm.preferredDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Additional Message</label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                />
              </div>
              
              <div className="booking-form-actions">
                <button 
                  type="button" 
                  className="booking-cancel-btn" 
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="booking-submit-btn"
                  disabled={!isBookingFormValid()}
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Confirmation Popup */}
      {showBookingConfirmation && bookingCar && (
        <div className="booking-confirmation-overlay">
          <div className="booking-confirmation-modal">
            <div className="confirmation-icon">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
            
            <h2>Appointment Booked Successfully!</h2>
            <p className="confirmation-message">
              Thank you for your interest in the <strong>{bookingCar.brand} {bookingCar.model}</strong>.
            </p>
            <p className="confirmation-details">
              Our luxury automobile specialist will contact you within the next 2-3 business days to confirm your appointment and discuss your requirements.
            </p>
            
            <div className="confirmation-next-steps">
              <h4>What happens next?</h4>
              <ul>
                <li>📞 We'll call you to confirm your preferred date and time</li>
                <li>📋 Prepare any questions about financing, features, or specifications</li>
                <li>🚗 Experience a personalized test drive and consultation</li>
              </ul>
            </div>
            
            <button 
              className="confirmation-close-btn" 
              onClick={() => setShowBookingConfirmation(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div id="contact-section" className="contact-section">
        <div className="contact-container">
          <h2>Contact S&A Motors</h2>
          <p>Our team of luxury automobile experts is ready to assist you in finding the perfect vehicle.</p>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-text">
                <h4>Email</h4>
                <p><a href="mailto:info@samotors.com">info@samotors.com</a></p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="contact-text">
                <h4>Phone</h4>
                <p><a href="tel:+911234567890">+91 123 456 7890</a></p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-text">
                <h4>Address</h4>
                <p>123 Luxury Lane, Automobile District<br />Mumbai, Maharashtra 400001</p>
              </div>
            </div>
          </div>
          
          <div className="business-hours">
            <h4>Business Hours</h4>
            <p>Monday - Friday: 10:00 AM - 8:00 PM</p>
            <p>Saturday: 10:00 AM - 6:00 PM</p>
            <p>Sunday: By Appointment Only</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} S&A Motors. All rights reserved.</p>
          <p>Luxury & Performance Automobiles</p>
        </div>
      </footer>

      {/* Image Gallery Popup */}
      {showGallery && selectedCar && (
        <div className="image-gallery-overlay" onClick={() => setShowGallery(false)}>
          <div className="image-gallery-container" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={() => setShowGallery(false)}>×</button>
            
            <div className="gallery-title">
              <h3>{selectedCar.brand} {selectedCar.model} - {selectedCar.year}</h3>
            </div>
            
            <div className="gallery-image-container">
              <div className="image-zoom-container">
                <img 
                  src={getCarImages(selectedCar.id)[currentImageIndex]} 
                  alt={`${selectedCar.brand} ${selectedCar.model}`}
                  className="gallery-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default.jpeg';
                  }}
                />
              </div>
              
              <div className="gallery-controls">
                <button 
                  className="gallery-nav-btn prev" 
                  onClick={(e) => { e.stopPropagation(); navigateGallery('prev'); }}
                >
                  &#10094;
                </button>
                <span className="gallery-counter">
                  {currentImageIndex + 1} / {getCarImages(selectedCar.id).length}
                </span>
                <button 
                  className="gallery-nav-btn next" 
                  onClick={(e) => { e.stopPropagation(); navigateGallery('next'); }}
                >
                  &#10095;
                </button>
              </div>
              
              <div className="gallery-thumbnails">
                {getCarImages(selectedCar.id).map((img, index) => (
                  <div 
                    key={index} 
                    className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default.jpeg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {(isAdmin || isStaff) && (
        <div className={`modal fade ${showAddModal ? "show d-block" : ""}`} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Car</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {["brand", "model", "year", "price", "stock"].map((field) => (
                  <input
                    key={field}
                    type={["year", "price", "stock"].includes(field) ? "number" : "text"}
                    className="form-control mb-2"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={newCar[field as keyof typeof newCar]}
                    onChange={(e) => setNewCar((prev) => ({ ...prev, [field]: e.target.value }))} />
                ))}
                <div className="mb-3">
                  <p className="form-label mt-3">Car Images (up to 3):</p>
                  {[0, 1, 2].map((index) => (
                    <input
                      key={`new-img-${index}`}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Image ${index + 1} filename (e.g., car${index + 1}.jpg)`}
                      value={newCar.tempImages[index] || ""}
                      onChange={(e) => handleImageInputChange(index, e.target.value)}
                    />
                  ))}
                  <small className="text-muted">
                    Enter filenames of images stored in the public folder.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddCar}>Save Car</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && editCar && (
        <div className={`modal fade ${showEditModal ? "show d-block" : ""}`} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Car</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {["brand", "model", "year", "price", "stock"].map((field) => (
                  <input
                    key={field}
                    type={["year", "price", "stock"].includes(field) ? "number" : "text"}
                    className="form-control mb-2"
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={editCar[field as keyof Car]}
                    onChange={(e) => setEditCar((prev) => ({ ...prev!, [field]: e.target.value }))} />
                ))}
                <div className="mb-3">
                  <p className="form-label mt-3">Car Images (up to 3):</p>
                  {[0, 1, 2].map((index) => (
                    <input
                      key={`edit-img-${index}`}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Image ${index + 1} filename (e.g., car${index + 1}.jpg)`}
                      value={(editCar.tempImages && editCar.tempImages[index]) || ""}
                      onChange={(e) => handleEditImageInputChange(index, e.target.value)}
                    />
                  ))}
                  <small className="text-muted">
                    Enter filenames of images stored in the public folder.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdateCar}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;