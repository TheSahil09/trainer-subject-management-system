# Trainer-Subject Management

Trainer-Subject Management is a full-stack web application for managing **subjects** and **trainers** in an institute. It exposes Spring Boot REST APIs for all operations and uses a simple React frontend with a common navbar and sidebar to interact with these APIs.

***

## Tech Stack

**Backend**

- Java (JDK 21+ recommended)  
- Spring Boot 3.x  
- Spring Web  
- Spring Data JPA  
- Maven (Spring Boot Maven Plugin)  
- MySQL

**Frontend**

- React  
- HTML, CSS, JavaScript  
- Axios or fetch for calling REST APIs

***

## Features

- Add and list **subjects** via REST API and UI.  
- Add and list **trainers** linked to specific subjects.  
- View trainers by subject and view trainer details by id/empId.  
- Delete trainers from the system.  
- Common layout with **navbar** (“Trainer-Subject Management”) and **sidebar** (Subjects, Trainers).  
- Subjects screen:
  - Add Subject form (Name, Description).  
  - Subjects List table (ID, Name, Description).  
- Trainers screen:
  - Add Trainer form (Emp ID, Name, Email, Subject dropdown).  
  - Trainers List table (ID, Emp ID, Name, Email, Subject ID, Subject, Actions).  
  - Filter by Subject dropdown.  
  - Trainer Details panel for the selected trainer.

***

## Project Structure

```text
Trainer-Subject_Management/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/nexanova/trainer_subject_app/
│   │   │       ├── TrainerSubjectAppApplication.java   # Spring Boot main class
│   │   │       ├── entity/
│   │   │       ├── repository/
│   │   │       └── controller/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── subject.html
│   │           └── trainer.html
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── pom.xml
└── README.md


## Database Setup (MySQL)

1. Start MySQL server.  
2. Create a database (example):

***sql
CREATE DATABASE nexanova_db;
***

3. Configure `src/main/resources/application.properties`:

***properties

spring.datasource.url=jdbc:mysql://localhost:3306/nexanova_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8080
```

Replace `YOUR_PASSWORD` with your actual MySQL password. Spring Data JPA will create the `subject` and `trainer` tables from the entities.

***

## REST API Endpoints

### Subject

- `POST /subject` – Add a new subject.

  Example request body:

  ```json
  {
    "name": "Java",
    "description": "Core Java"
  }
  ```

- `GET /subject` – Get list of all subjects.  
- `GET /subject/{id}` – Get a single subject by id (optionally with trainers).

### Trainer

- `POST /trainer` – Add a new trainer linked to a subject.

  Example request body:

  ```json
  {
    "empId": "T001",
    "name": "Rahul",
    "email": "rahul@example.com",
    "subject": { "id": 1 }
  }
  ```

- `GET /trainer` – Get list of all trainers.  
- `GET /trainer/{id}` – Get trainer by `empId` (string path variable).  
- `DELETE /trainer/{id}` – Delete trainer by internal numeric `id`.  
- `GET /trainer/{subject}/topic` – Get trainers who teach a given subject name.[1]

***

## Running the Application

### Backend

1. Ensure MySQL is running and `application.properties` is configured.  
2. Open the backend project in IntelliJ IDEA or your preferred IDE.  
3. Run `TrainerSubjectAppApplication` (Spring Boot main class).  
4. Backend will start on `http://localhost:8080` (change if you configured a different port).

You can still access the simple test pages if kept:

- `http://localhost:8080/subject.html`  
- `http://localhost:8080/trainer.html`

### Frontend (React)

1. Open a terminal in the `frontend` folder.  
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. React app will run on `http://localhost:3000` and communicate with the backend APIs at `http://localhost:8080` (using axios/fetch in the services layer).

Make sure any base URL in your frontend API service points to the correct backend address.

***

## Known Limitations

- No authentication/authorization.  
- Basic validation and error handling.  
- No pagination or advanced search; tables show simple lists.  
- UI is focused on clarity (admin‑style layout) rather than production design.

***

## Manual Testing

Manual test cases (create subject, list subjects, create trainer, list trainers, get trainer by id, delete trainer, get trainers by subject) can be executed using the React UI, the static HTML pages, or tools like Postman. Keep a separate document (for example `docs/test-cases.md`) to record test steps and results.

***

