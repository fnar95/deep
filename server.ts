import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { WeeklyPlan, Teacher, Subject, Grade, WeekStats } from './src/types';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

app.use(express.json());

// List of available subjects
const SUBJECTS: Subject[] = [
  'الرياضيات',
  'العلوم',
  'اللغة الإنجليزية',
  'لغتي',
  'الدراسات الإسلامية',
  'الدراسات الاجتماعية',
  'المهارات الرقمية',
  'التربية البدنية',
  'التربية الأسرية',
  'التفكير الناقد'
];

// List of grades
const GRADES: Grade[] = ['أول متوسط', 'ثاني متوسط', 'ثالث متوسط'];

// Default Teacher list with credentials
const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'أ. أحمد الحربي', subject: 'الرياضيات', username: 'ahmed', password: '123' },
  { id: 't2', name: 'أ. خالد الغامدي', subject: 'العلوم', username: 'khaled', password: '123' },
  { id: 't3', name: 'أ. محمد القحطاني', subject: 'اللغة الإنجليزية', username: 'mohammad', password: '123' },
  { id: 't4', name: 'أ. علي الشمراني', subject: 'لغتي', username: 'ali', password: '123' },
  { id: 't5', name: 'أ. يوسف السهلي', subject: 'الدراسات الإسلامية', username: 'yousef', password: '123' },
  { id: 't6', name: 'أ. عبد الرحمن العتيبي', subject: 'الدراسات الاجتماعية', username: 'abdulrahman', password: '123' },
  { id: 't7', name: 'أ. فهد المطيري', subject: 'المهارات الرقمية', username: 'fahad', password: '123' },
  { id: 't8', name: 'أ. ياسر الزهراني', subject: 'التربية البدنية', username: 'yasser', password: '123' },
  { id: 't9', name: 'أ. صالح البلوي', subject: 'التربية الأسرية', username: 'saleh', password: '123' },
  { id: 't10', name: 'أ. ناصر الدوسري', subject: 'التفكير الناقد', username: 'nasser', password: '123' }
];

// Seed some initial plans for Week 1 and Week 2 to make the site look stunning out-of-the-box
const INITIAL_PLANS: WeeklyPlan[] = [
  {
    id: 'p1',
    week: 1,
    grade: 'أول متوسط',
    subject: 'الرياضيات',
    title: 'الخطوات الأربع لحل المسألة',
    objectives: '1. أن يتعرف الطالب على الخطوات الأربع لحل المسألة الرياضية.\n2. تطبيق الخطوات في حل مسائل حياتية بسيطة.',
    homework: 'حل تدريبات كتاب الطالب صفحة 14، الأسئلة الفردية (1، 3، 5).',
    notes: 'الرجاء إحضار الدفتر المخصص للمادة وهندسة الأدوات.',
    teacherId: 't1',
    teacherName: 'أ. أحمد الحربي',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    week: 1,
    grade: 'أول متوسط',
    subject: 'العلوم',
    title: 'العلم وعملياته - المهارات العلمية',
    objectives: '1. توضيح مفهوم العلم ودور الملاحظة والافتراض.\n2. تمييز المتغيرات المستقلة والتابعة في التجربة.',
    homework: 'رسم خريطة مفاهيم للمهارات العلمية الأساسية في دفتر العلوم.',
    notes: 'إجراء تجربة استقصائية بسيطة في المعمل المدرسي.',
    teacherId: 't2',
    teacherName: 'أ. خالد الغامدي',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    week: 1,
    grade: 'أول متوسط',
    subject: 'اللغة الإنجليزية',
    title: 'Unit 1: Lifestyles - Grammar & Vocabulary',
    objectives: '1. Present simple vs Present progressive.\n2. Discussing daily routines and hobbies.',
    homework: 'Workbook Page 3, exercises A & B.',
    notes: 'Students should use audio resources on the school platform for listening practice.',
    teacherId: 't3',
    teacherName: 'أ. محمد القحطاني',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p4',
    week: 1,
    grade: 'ثاني متوسط',
    subject: 'لغتي',
    title: 'تقنيات: المدخل والفهم القرائي (رسام القلب)',
    objectives: '1. قراءة النص قراءة صامتة وجهرية معبرة.\n2. استخراج المفردات الجديدة وتوظيفها في جمل مفيدة.',
    homework: 'إجابة أسئلة معجمي اللغوي ص 22 في الكتاب المدرسي.',
    notes: 'التركيز على مهارة الاستماع والمناقشة الجماعية.',
    teacherId: 't4',
    teacherName: 'أ. علي الشمراني',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p5',
    week: 1,
    grade: 'ثالث متوسط',
    subject: 'الدراسات الإسلامية',
    title: 'التوحيد: الإيمان بالله وعلاماته',
    objectives: '1. بيان مفهوم الإيمان وأركانه الستة.\n2. التعرف على ثمرات الإيمان في سلوك الطالب اليومي.',
    homework: 'كتابة ملخص مكون من 5 أسطر عن أثر الإيمان في توجيه السلوك.',
    notes: 'مناقشة تفاعلية في الصف حول عظمة الخالق سبحانه وتعالى.',
    teacherId: 't5',
    teacherName: 'أ. يوسف السهلي',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p6',
    week: 1,
    grade: 'أول متوسط',
    subject: 'الدراسات الاجتماعية',
    title: 'الحضارات القديمة: حضارة بلاد الرافدين',
    objectives: '1. تحديد موقع حضارة بلاد الرافدين على الخريطة.\n2. تعداد أهم المنجزات الحضارية للسومريين والبابليين.',
    homework: 'رسم خط زمني لأهم فترات حضارة بلاد الرافدين.',
    notes: 'عرض مرئي تفاعلي لمدينة بابل الأثرية.',
    teacherId: 't6',
    teacherName: 'أ. عبد الرحمن العتيبي',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p7',
    week: 1,
    grade: 'أول متوسط',
    subject: 'المهارات الرقمية',
    title: 'مقدمة في الحاسب ونظام التشغيل',
    objectives: '1. التعرف على المكونات المادية للحاسب.\n2. إدارة الملفات والمجلدات في نظام التشغيل ويندوز.',
    homework: 'إنشاء مجلد باسم الطالب على الحاسوب المنزلي وإرسال لقطة شاشة.',
    notes: 'التطبيق العملي في معامل المدرسة متاح يومياً بعد الحصة السادسة.',
    teacherId: 't7',
    teacherName: 'أ. فهد المطيري',
    updatedAt: new Date().toISOString()
  }
];

// Load or Initialize Data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      teachers: INITIAL_TEACHERS,
      plans: INITIAL_PLANS,
      principalSettings: { username: 'principal', password: 'admin123', email: 'principal@school.com' }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const db = JSON.parse(raw);
    if (!db.principalSettings) {
      db.principalSettings = { username: 'principal', password: 'admin123', email: 'principal@school.com' };
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (error) {
    console.error('Error reading data file, resetting to defaults...', error);
    const defaultData = {
      teachers: INITIAL_TEACHERS,
      plans: INITIAL_PLANS,
      principalSettings: { username: 'principal', password: 'admin123', email: 'principal@school.com' }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveData(data: { teachers: Teacher[]; plans: WeeklyPlan[] }) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing data file:', error);
  }
}

// Ensure database file is ready
loadData();

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع صورة أو ملف PDF فقط.'));
    }
  }
});

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- API ENDPOINTS ---

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم تحديد أي ملف للرفع' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
  const attachmentType = isPdf ? 'pdf' : 'image';

  res.json({
    success: true,
    fileUrl,
    attachmentType,
    attachmentName: req.file.originalname
  });
});

// Get all weekly plans (with optional filters)
app.get('/api/plans', (req, res) => {
  const { week, grade } = req.query;
  const db = loadData();
  let filtered = db.plans;

  if (week) {
    filtered = filtered.filter((p: WeeklyPlan) => p.week === parseInt(week as string));
  }
  if (grade) {
    filtered = filtered.filter((p: WeeklyPlan) => p.grade === (grade as string));
  }

  res.json(filtered);
});

// Create or update a weekly plan
app.post('/api/plans', (req, res) => {
  const { 
    id, week, grade, subject, title, objectives, homework, notes, 
    teacherId, teacherName, attachmentUrl, attachmentType, attachmentName 
  } = req.body;

  if (!week || !grade || !subject || !title || !teacherId) {
    return res.status(400).json({ error: 'الحقول المطلوبة مفقودة' });
  }

  const db = loadData();
  
  // Find if teacher exists and matches
  const teacher = db.teachers.find((t: Teacher) => t.id === teacherId);
  if (!teacher) {
    return res.status(403).json({ error: 'المعلم غير موجود في النظام' });
  }

  // Check if there is an existing plan for this (week, grade, subject) to update it,
  // or if we have an ID to update. Or create a new one.
  let planIndex = -1;
  if (id) {
    planIndex = db.plans.findIndex((p: WeeklyPlan) => p.id === id);
  } else {
    // Check collision: One plan per (week, grade, subject)
    planIndex = db.plans.findIndex((p: WeeklyPlan) => 
      p.week === parseInt(week) && 
      p.grade === grade && 
      p.subject === subject
    );
  }

  const updatedPlan: WeeklyPlan = {
    id: id || `plan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    week: parseInt(week),
    grade,
    subject,
    title,
    objectives: objectives || '',
    homework: homework || '',
    notes: notes || '',
    teacherId,
    teacherName: teacherName || teacher.name,
    updatedAt: new Date().toISOString(),
    attachmentUrl,
    attachmentType,
    attachmentName
  };

  if (planIndex >= 0) {
    db.plans[planIndex] = updatedPlan;
  } else {
    db.plans.push(updatedPlan);
  }

  saveData(db);
  res.json({ success: true, plan: updatedPlan });
});

// Delete a plan
app.delete('/api/plans/:id', (req, res) => {
  const { id } = req.params;
  const db = loadData();
  const initialLength = db.plans.length;
  db.plans = db.plans.filter((p: WeeklyPlan) => p.id !== id);

  if (db.plans.length === initialLength) {
    return res.status(404).json({ error: 'الخطة غير موجودة' });
  }

  saveData(db);
  res.json({ success: true });
});

// Get all teachers (without passwords for safety)
app.get('/api/teachers', (req, res) => {
  const db = loadData();
  const cleanTeachers = db.teachers.map(({ id, name, subject, username }: Teacher) => ({
    id, name, subject, username
  }));
  res.json(cleanTeachers);
});

// Registration endpoint for new Teachers
app.post('/api/register', (req, res) => {
  const { name, email, subject, password } = req.body;

  if (!name || !email || !subject || !password) {
    return res.status(400).json({ error: 'الرجاء تعبئة جميع الحقول المطلوبة' });
  }

  const db = loadData();
  
  // Check if email already registered
  const existingTeacher = db.teachers.find((t: Teacher) => 
    (t.email && t.email.toLowerCase() === email.toLowerCase()) || 
    t.username.toLowerCase() === email.toLowerCase()
  );

  if (existingTeacher) {
    return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل باسم حساب آخر' });
  }

  const newId = `t_${Date.now()}`;
  const newTeacher: Teacher = {
    id: newId,
    name,
    subject,
    username: email.split('@')[0], // Set standard username as prefix of email
    email,
    password
  };

  db.teachers.push(newTeacher);
  saveData(db);

  res.json({
    success: true,
    session: {
      role: 'teacher',
      teacherId: newTeacher.id,
      name: newTeacher.name,
      subject: newTeacher.subject
    }
  });
});

// Forgot password endpoint
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني' });
  }

  const db = loadData();
  const teacher = db.teachers.find((t: Teacher) => 
    (t.email && t.email.toLowerCase() === email.toLowerCase()) || 
    t.username.toLowerCase() === email.toLowerCase()
  );

  if (!teacher) {
    return res.status(404).json({ error: 'لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني' });
  }

  res.json({
    success: true,
    password: teacher.password
  });
});

// Principal Forgot password endpoint
app.post('/api/principal/forgot-password', (req, res) => {
  const { emailOrUsername } = req.body;

  if (!emailOrUsername) {
    return res.status(400).json({ error: 'الرجاء إدخال اسم المستخدم أو البريد الإلكتروني للمدير' });
  }

  const db = loadData();
  const settings = db.principalSettings || { username: 'principal', password: 'admin123', email: 'principal@school.com' };

  if (
    emailOrUsername.toLowerCase() === settings.username.toLowerCase() ||
    (settings.email && emailOrUsername.toLowerCase() === settings.email.toLowerCase())
  ) {
    return res.json({
      success: true,
      password: settings.password
    });
  }

  return res.status(404).json({ error: 'لم يتم العثور على حساب مدير مرتبط بالاسم أو البريد المدخل' });
});

// Update Principal Settings (username, password, email)
app.post('/api/principal/settings', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان لتحديث الحساب' });
  }

  const db = loadData();
  db.principalSettings = {
    username,
    password,
    email: email || ''
  };

  saveData(db);

  res.json({
    success: true,
    principalSettings: db.principalSettings
  });
});

// Get Principal Settings
app.get('/api/principal/settings', (req, res) => {
  const db = loadData();
  const settings = db.principalSettings || { username: 'principal', password: 'admin123', email: 'principal@school.com' };
  res.json({
    username: settings.username,
    email: settings.email || ''
  });
});

// Login endpoint for Teachers and Principal
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
  }

  if (role === 'principal') {
    // Principal login
    const db = loadData();
    const settings = db.principalSettings || { username: 'principal', password: 'admin123', email: 'principal@school.com' };
    if (
      (username.toLowerCase() === settings.username.toLowerCase() || 
       (settings.email && username.toLowerCase() === settings.email.toLowerCase())) && 
      password === settings.password
    ) {
      return res.json({
        success: true,
        session: {
          role: 'principal',
          name: 'مدير المدرسة',
          username: settings.username
        }
      });
    } else {
      return res.status(401).json({ error: 'اسم المستخدم/البريد الإلكتروني أو كلمة المرور لمدير المدرسة غير صحيحة' });
    }
  } else {
    // Teacher login
    const db = loadData();
    const teacher = db.teachers.find((t: Teacher) => 
      (t.username.toLowerCase() === username.toLowerCase() || (t.email && t.email.toLowerCase() === username.toLowerCase())) && t.password === password
    );

    if (teacher) {
      return res.json({
        success: true,
        session: {
          role: 'teacher',
          teacherId: teacher.id,
          name: teacher.name,
          subject: teacher.subject
        }
      });
    } else {
      return res.status(401).json({ error: 'اسم المستخدم/البريد الإلكتروني أو كلمة المرور للمعلم غير صحيحة' });
    }
  }
});

// Get completion stats per week for the Principal
app.get('/api/stats', (req, res) => {
  const db = loadData();
  const stats: WeekStats[] = [];

  // Total expected plans per week = 3 grades * 10 subjects = 30 plans
  const totalSubjects = SUBJECTS.length;
  const totalGrades = GRADES.length;
  const expectedCount = totalSubjects * totalGrades; // 30

  for (let w = 1; w <= 18; w++) {
    const uploadedCount = db.plans.filter((p: WeeklyPlan) => p.week === w).length;
    stats.push({
      week: w,
      uploadedCount,
      expectedCount,
      percentage: Math.round((uploadedCount / expectedCount) * 100)
    });
  }

  res.json({
    stats,
    totalUploaded: db.plans.length,
    totalExpected: expectedCount * 18,
    percentage: Math.round((db.plans.length / (expectedCount * 18)) * 100)
  });
});

// Setup Vite Development or Production mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
