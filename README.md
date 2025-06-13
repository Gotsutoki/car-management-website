# 🚗 Car Management Website

A full-stack web application for managing car data, built with **React & TypeScript** on the frontend and **Django & MySQL** on the backend.

---

## 📌 Project Overview

This project demonstrates a complete full-stack setup combining a modern React frontend with a Django REST API backend connected to a MySQL database. It allows users to add, update, view, and manage car information through an intuitive interface.

---

## 📁 Project Structure

car-management-website/
├── frontend/ # React + TypeScript frontend
├── backend/ # Django + MySQL backend
├── README.md



## 🚀 Technologies Used

- **Frontend:** React, TypeScript, HTML, CSS
- **Backend:** Django (Python)
- **Database:** MySQL
- **API:** Django REST Framework
- **Tools:** Git, GitHub, VS Code

---

## ⚙️ How to Run

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/car-management-website.git
cd car-management-website

2️⃣ Configure Environment Variables
Inside car-management-website/ car_backend/showroom/showroom/setting.py update the database based on your mysql

DB_NAME=car_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=your_django_secret_key
DEBUG=True
Update these values according to your local MySQL setup.


3️⃣ Install Backend Requirements

cd car_backend

# Create & activate virtual environment
python -m venv car_venv
source car_venv/bin/activate  # Mac/Linux
# OR
car_venv\Scripts\activate     # Windows

cd showroom
# Install dependencies
pip install Django>=4.0
            djangorestframework
            mysqlclient
            python-decouple

# Apply migrations
python manage.py migrate

# Run the server
python manage.py runserver
Django API runs at http://localhost:8000

4️⃣ Run the Frontend
Open a new terminal:

cd car_frontend
cd car_inventory
npm install
npm run dev

📦 Features
✅ React + TypeScript frontend

✅ Django REST API backend

✅ MySQL database integration

✅ CRUD operations for cars

✅ Clean project structure for learning and extension

