# MentorConnect Backend API

Backend API for MentorConnect - A platform connecting students with mentors for doubt resolution.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentorconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "class": "BSCIT Sem 3",
  "course": "BSCIT"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

### Mentor Routes (`/api/mentors`)

#### Get All Mentors
- **GET** `/api/mentors`

#### Get Mentor by ID
- **GET** `/api/mentors/:id`

#### Get Mentors by Subject
- **GET** `/api/mentors/subject/:subject`

#### Add Mentor (Admin Only)
- **POST** `/api/mentors`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**:
```json
{
  "name": "Sabiha",
  "email": "sabiha@example.com",
  "password": "password123",
  "subject": "Digital Electronics",
  "expertise": "Expert in Digital Circuits",
  "bio": "10 years of teaching experience"
}
```

---

### Doubt Routes (`/api/doubts`)

#### Submit a Doubt (Student)
- **POST** `/api/doubts`
- **Headers**: `Authorization: Bearer <student_token>`
- **Body** (multipart/form-data):
  - `mentorId`: Mentor's ID
  - `subject`: Subject name
  - `remarks`: Doubt description
  - `meetLink`: Google Meet link
  - `doubtImage`: Image file

#### Get My Doubts (Student)
- **GET** `/api/doubts/my-doubts`
- **Headers**: `Authorization: Bearer <student_token>`

#### Get Mentor Doubts (Mentor)
- **GET** `/api/doubts/mentor-doubts?status=pending`
- **Headers**: `Authorization: Bearer <mentor_token>`

#### Get Doubt by ID
- **GET** `/api/doubts/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Update Doubt Status (Mentor)
- **PUT** `/api/doubts/:id/status`
- **Headers**: `Authorization: Bearer <mentor_token>`
- **Body**:
```json
{
  "status": "resolved",
  "mentorResponse": "Your doubt has been clarified"
}
```

#### Delete Doubt
- **DELETE** `/api/doubts/:id`
- **Headers**: `Authorization: Bearer <token>`

---

### Feedback Routes (`/api/feedback`)

#### Submit Feedback (Student)
- **POST** `/api/feedback`
- **Headers**: `Authorization: Bearer <student_token>`
- **Body**:
```json
{
  "doubtId": "doubt_id_here",
  "rating": 5,
  "comment": "Great explanation!"
}
```

#### Get Mentor Feedback
- **GET** `/api/feedback/mentor/:mentorId`

#### Get Feedback by Doubt
- **GET** `/api/feedback/doubt/:doubtId`
- **Headers**: `Authorization: Bearer <token>`

#### Get My Feedbacks (Student)
- **GET** `/api/feedback/my-feedbacks`
- **Headers**: `Authorization: Bearer <student_token>`

---

## Database Models

### User
- name, email, password, role (student/mentor/admin)
- Student: class, course
- Mentor: subject, expertise, bio

### Doubt
- student, mentor references
- studentName, studentClass, studentCourse
- subject, doubtImage, remarks, meetLink
- status (pending/in-progress/resolved)
- mentorResponse, resolvedAt

### Feedback
- doubt, student, mentor references
- rating (1-5), comment

## Testing

Use Postman or any API client to test the endpoints.

1. Register a student
2. Register/Add mentors
3. Login as student
4. Get all mentors
5. Submit a doubt
6. Login as mentor
7. View and update doubts
8. Student submits feedback

## Notes

- File uploads are stored in `/uploads/doubts/`
- JWT tokens expire in 30 days
- All protected routes require `Authorization: Bearer <token>` header
