# 🗄️ MongoDB Database Schema Documentation

## Collections Overview


┌─────────────────────────────────┐
│          USERS                  │
├─────────────────────────────────┤
│ 🔑 _id (ObjectId)               │
│ 📧 email (unique)               │
│ 🔒 password_hash                │
│ 👤 full_name                    │
│ 🏷️  role                         │
│ ✅ is_active                     │
│ 📅 createdAt (auto)             │
│ 📅 updatedAt (auto)             │
└──────────┬──────────────────────┘
           │
           │ Referenced by user_id
           │
    ┌──────┴────────┬
    │               │              
    ▼               ▼              
┌──────────────┐ ┌──────────────┐ 
│ ATTENDANCES  │ │    TASKS     │ 
├──────────────┤ ├──────────────┤ 
│ 🔑 _id       │ │ 🔑 _id       │
│ 🔗 user_id   │ │ 🔗 user_id   │
│ 🕐 check_in  │ │ 📝 title     │
│ 🕑 check_out │ │ 📄 desc      │
│ 📅 date      │ │ 🎯 status    │
│ 🏷️  status   │ │ ⭐ priority  │
│ 📝 notes     │ │ 📅 due_date  │
│ 📅 createdAt │ │ ✅ completed │
│ 📅 updatedAt │ │ 📅 createdAt │
└──────────────┘ │ 📅 updatedAt │
   UNIQUE INDEX:  └──────────────┘
   (user_id, date)


---

## Collection Schemas

### 1. Users Collection


{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "john.doe@example.com",
  password_hash: "$2b$12$KIX...",
  full_name: "John Doe",
  role: "user",
  is_active: true,
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z")
}


**Mongoose Schema:**
typescript
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user',
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true // Auto createdAt & updatedAt
});


**Indexes:**

userSchema.index({ email: 1 }); // Single field index


**Field Descriptions:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto | MongoDB unique identifier |
| email | String | Yes | - | User's email (login) |
| password_hash | String | Yes | - | Bcrypt hashed password |
| full_name | String | Yes | - | User's full name |
| role | String | No | 'user' | User role |
| is_active | Boolean | No | true | Account status |
| createdAt | Date | Auto | Auto | Creation timestamp |
| updatedAt | Date | Auto | Auto | Last update timestamp |

---

### 2. Attendances Collection


{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  check_in_time: ISODate("2024-01-15T09:00:00.000Z"),
  check_out_time: ISODate("2024-01-15T17:30:00.000Z"),
  date: "2024-01-15",
  status: "present",
  notes: "Arrived early today",
  createdAt: ISODate("2024-01-15T09:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T17:30:00.000Z")
}


**Mongoose Schema:**
typescript
const attendanceSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  check_in_time: {
    type: Date,
    required: true,
    default: Date.now,
  },
  check_out_time: {
    type: Date,
    default: null,
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'on_leave', 'remote'],
    default: 'present',
  },
  notes: {
    type: String,
    default: null,
  },
}, {
  timestamps: true
});


**Indexes:**

// Compound unique index - prevents duplicate attendance per day
attendanceSchema.index({ user_id: 1, date: 1 }, { unique: true });

// Single field indexes
attendanceSchema.index({ date: -1 }); // For date queries


**Field Descriptions:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto | Unique identifier |
| user_id | ObjectId | Yes | - | Reference to User |
| check_in_time | Date | Yes | Date.now | Check-in timestamp |
| check_out_time | Date | No | null | Check-out timestamp |
| date | String | Yes | - | Date (YYYY-MM-DD) |
| status | String | No | 'present' | Attendance status |
| notes | String | No | null | Optional notes |
| createdAt | Date | Auto | Auto | Creation timestamp |
| updatedAt | Date | Auto | Auto | Last update timestamp |

**Business Rules:**
- One attendance record per user per day (enforced by unique index)
- Check-in required before check-out
- Date format: YYYY-MM-DD
- Status values: present, absent, on_leave, remote

---

### 3. Tasks Collection


{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  title: "Complete project documentation",
  description: "Write comprehensive README and API docs",
  status: "in_progress",
  priority: "high",
  due_date: ISODate("2024-01-20T17:00:00.000Z"),
  completed_at: null,
  createdAt: ISODate("2024-01-15T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T14:30:00.000Z")
}


**Mongoose Schema:**
typescript
const taskSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  due_date: {
    type: Date,
    default: null,
    index: true,
  },
  completed_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true
});


**Indexes:**

// Compound indexes for common queries
taskSchema.index({ user_id: 1, status: 1 });
taskSchema.index({ user_id: 1, priority: 1 });

// Single field indexes
taskSchema.index({ due_date: 1 });


**Field Descriptions:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| _id | ObjectId | Auto | Auto | Unique identifier |
| user_id | ObjectId | Yes | - | Task owner |
| title | String | Yes | - | Task title (max 255) |
| description | String | No | null | Detailed description |
| status | String | No | 'pending' | Current status |
| priority | String | No | 'medium' | Priority level |
| due_date | Date | No | null | Optional deadline |
| completed_at | Date | No | null | Completion timestamp |
| createdAt | Date | Auto | Auto | Creation timestamp |
| updatedAt | Date | Auto | Auto | Last update timestamp |

**Status Values:**
- `pending`: Not started
- `in_progress`: Being worked on
- `completed`: Finished
- `cancelled`: Cancelled/abandoned

**Priority Values:**
- `low`: Can wait
- `medium`: Normal (default)
- `high`: Urgent

---

## Indexes Strategy

### Why These Indexes?

1. **users.email (unique)**
   - Fast login queries
   - Enforces uniqueness
   - Used in every auth request

2. **attendances.user_id**
   - Fast retrieval of user's history
   - Used in all attendance queries

3. **attendances.date**
   - Quick date-based lookups
   - Used in history and reports

4. **attendances (user_id, date) - UNIQUE**
   - Prevents duplicate attendance
   - Fastest lookup for today's record
   - Compound index for both fields

5. **tasks.user_id**
   - Fast task list retrieval
   - Most common query pattern

6. **tasks.status**
   - Filter tasks by status
   - Dashboard views

7. **tasks.due_date**
   - Sort by deadline
   - Find overdue tasks

8. **tasks (user_id, status)**
   - Combined filter
   - Common query pattern

---

## Data Relationships

### References (Similar to Foreign Keys)

1. **User → Attendance (One-to-Many)**
   
   // In attendance document
   user_id: ObjectId("507f1f77bcf86cd799439011")
   
   // Populate to get user details
   await Attendance.findOne({ _id: id }).populate('user_id');
   

2. **User → Tasks (One-to-Many)**
   
   // In task document
   user_id: ObjectId("507f1f77bcf86cd799439011")
   
   // Find all tasks for user
   await Task.find({ user_id: userId });
   

---

## Query Examples

### Common Queries

#### 1. User Login

await User.findOne({ email: email });


#### 2. Today's Attendance

const today = new Date().toISOString().split('T')[0];
await Attendance.findOne({ 
  user_id: userId, 
  date: today 
});


#### 3. Check In (with duplicate prevention)

await Attendance.create({
  user_id: userId,
  date: today,
  check_in_time: new Date(),
  status: 'present'
});
// Throws error if (user_id, date) already exists


#### 4. Get User Tasks

await Task.find({ user_id: userId })
  .sort({ status: 1, priority: 1, due_date: 1 });


#### 5. Update Task Status

const task = await Task.findOne({ _id: taskId, user_id: userId });
task.status = 'completed';
task.completed_at = new Date();
await task.save();


#### 6. Attendance History (Paginated)

await Attendance.find({ user_id: userId })
  .sort({ date: -1 })
  .limit(30)
  .skip(0);


---

## MongoDB Advantages

### 1. No Migrations
Collections are created automatically on first insert:

// Just insert - collection is created if it doesn't exist
await User.create({ email, password_hash, full_name });


### 2. Flexible Schema
Easy to add fields without migrations:

// Add new field - no migration needed
user.avatar_url = "https://...";
await user.save();


### 3. JSON Native
Perfect match for JavaScript/TypeScript:

// Store complex objects directly
task.metadata = {
  tags: ['urgent', 'client'],
  attachments: ['file1.pdf'],
  custom_fields: { ... }
};


### 4. Powerful Queries

// Complex aggregations
await Task.aggregate([
  { $match: { user_id: ObjectId(userId) } },
  { $group: { 
      _id: "$status", 
      count: { $sum: 1 } 
  }}
]);


---

## Unique Constraints

### Enforced by MongoDB

1. **Email Uniqueness**
   
   { email: 1 } // unique index
   

2. **One Attendance Per Day**
   
   { user_id: 1, date: 1 } // unique compound index
   

### Error Handling

typescript
try {
  await Attendance.create({ user_id, date, ... });
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error
    throw new AppError('Already checked in today', 400);
  }
}


---

## Data Validation

### Mongoose Schema Validation


// Automatic validation
title: {
  type: String,
  required: [true, 'Title is required'],
  maxlength: [255, 'Title too long'],
  trim: true
}

// Enum validation
status: {
  type: String,
  enum: ['pending', 'in_progress', 'completed', 'cancelled']
}


### Application Layer (Zod)

typescript
// Additional validation before Mongoose
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().datetime().optional(),
});


---

## Best Practices Implemented

✅ **Indexes**: Strategic indexes on frequently queried fields
✅ **Validation**: Schema-level and application-level
✅ **Timestamps**: Automatic createdAt/updatedAt
✅ **References**: ObjectId refs for relationships
✅ **Constraints**: Unique indexes where needed
✅ **Defaults**: Sensible default values
✅ **Enums**: Restricted values for status/priority
✅ **Trimming**: Auto-trim strings

---

## MongoDB Compass Queries

View data using MongoDB Compass:


// Find all users
db.users.find().pretty()

// Find user by email
db.users.findOne({ email: "test@example.com" })

// Count attendance records
db.attendances.countDocuments({ user_id: ObjectId("...") })

// Get tasks by status
db.tasks.find({ status: "pending" })

// Aggregate task counts by status
db.tasks.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])


---

## Future Enhancements

Potential schema additions:

1. **Teams Collection**
   
   {
     _id: ObjectId,
     name: String,
     members: [ObjectId],
     created_by: ObjectId
   }
   

2. **Notifications Collection**
   
   {
     _id: ObjectId,
     user_id: ObjectId,
     message: String,
     read: Boolean,
     type: String
   }
   

3. **Comments on Tasks**
   
   {
     _id: ObjectId,
     task_id: ObjectId,
     user_id: ObjectId,
     comment: String,
     createdAt: Date
   }
   

---

**MongoDB makes your data flexible, scalable, and easy to work with!** 🚀
