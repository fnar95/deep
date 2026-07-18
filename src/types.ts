export type Grade = 'أول متوسط' | 'ثاني متوسط' | 'ثالث متوسط';

export type Subject =
  | 'الرياضيات'
  | 'العلوم'
  | 'اللغة الإنجليزية'
  | 'لغتي'
  | 'الدراسات الإسلامية'
  | 'الدراسات الاجتماعية'
  | 'المهارات الرقمية'
  | 'التربية البدنية'
  | 'التربية الأسرية'
  | 'التفكير الناقد';

export interface WeeklyPlan {
  id: string;
  week: number; // 1 to 18
  grade: Grade;
  subject: Subject;
  title: string;       // موضوع / عنوان الدرس
  objectives?: string; // الأهداف والأنشطة
  homework?: string;   // الواجب المنزلي
  notes?: string;      // ملاحظات وتنبيهات
  teacherId: string;   // المعلم المضيف
  teacherName: string; // اسم المعلم
  updatedAt: string;   // تاريخ التحديث
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  attachmentName?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: Subject;
  username: string;
  email?: string;
  password?: string; // Client will receive hashed or clean for login
}

export interface UserSession {
  role: 'teacher' | 'principal' | 'guest';
  teacherId?: string;
  name: string;
  subject?: Subject;
}

export interface WeekStats {
  week: number;
  uploadedCount: number;
  expectedCount: number; // usually 30 (10 subjects * 3 grades)
  percentage: number;
}
