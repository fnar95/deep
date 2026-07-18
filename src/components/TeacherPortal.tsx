import React, { useState } from 'react';
import { 
  Lock, User, GraduationCap, ChevronLeft, Plus, Edit, Trash2, 
  Save, X, FileText, CheckCircle, AlertCircle, Info, LogOut,
  Upload, Paperclip, Mail, BookOpen
} from 'lucide-react';
import { Grade, Subject, WeeklyPlan, UserSession } from '../types';

interface TeacherPortalProps {
  plans: WeeklyPlan[];
  session: UserSession | null;
  onLogin: (credentials: any) => Promise<boolean>;
  onLogout: () => void;
  onSavePlan: (plan: Partial<WeeklyPlan>) => Promise<boolean>;
  onDeletePlan: (id: string) => Promise<boolean>;
}

export default function TeacherPortal({ 
  plans, 
  session, 
  onLogin, 
  onLogout, 
  onSavePlan, 
  onDeletePlan 
}: TeacherPortalProps) {
  
  // Auth Mode State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'teacher' | 'principal'>('teacher');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Registration States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerSubject, setRegisterSubject] = useState<Subject>('الرياضيات');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [submittingRegister, setSubmittingRegister] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('');

  // Password Recovery States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);

  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<WeeklyPlan> | null>(null);
  const [formError, setFormError] = useState('');
  const [submittingForm, setSubmittingForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle upload of file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في رفع الملف');
      }

      const data = await response.json();
      if (data.success && editingPlan) {
        setEditingPlan({
          ...editingPlan,
          attachmentUrl: data.fileUrl,
          attachmentType: data.attachmentType,
          attachmentName: data.attachmentName
        });
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeAttachment = () => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        attachmentUrl: undefined,
        attachmentType: undefined,
        attachmentName: undefined
      });
    }
  };

  // Filter Teacher's plans
  const teacherPlans = plans.filter(p => p.teacherId === session?.teacherId);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);

    if (!username.trim() || !password.trim()) {
      setLoginError('الرجاء إدخال اسم المستخدم وكلمة المرور');
      setSubmittingLogin(false);
      return;
    }

    const success = await onLogin({ username, password, role: loginRole, rememberMe });
    if (!success) {
      setLoginError('فشل الدخول: اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    setSubmittingLogin(false);
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccessMessage('');

    if (!registerName.trim()) {
      setRegisterError('الرجاء إدخال اسم المعلم');
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes('@')) {
      setRegisterError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      setRegisterError('الرجاء إدخال كلمة مرور مكونة من ٤ خانات على الأقل');
      return;
    }

    setSubmittingRegister(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          subject: registerSubject,
          password: registerPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل حساب جديد');
      }

      setRegisterSuccessMessage('تم إنشاء الحساب واشتراكك بنجاح! جاري تسجيل دخولك تلقائياً...');
      
      // Auto login after success
      setTimeout(() => {
        onLogin({ username: registerEmail, password: registerPassword, role: 'teacher' });
      }, 1500);

    } catch (err: any) {
      setRegisterError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setSubmittingRegister(false);
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccessMessage('');

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setSubmittingForgot(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'لم يتم العثور على الحساب');
      }

      setForgotSuccessMessage(`تم استرجاع الرقم السري بنجاح! رقمك السري هو: ( ${data.password} )`);
    } catch (err: any) {
      setForgotError(err.message || 'حدث خطأ أثناء استرجاع الرقم السري');
    } finally {
      setSubmittingForgot(false);
    }
  };

  // Open Editor for Creating/Editing a Plan
  const openEditor = (plan: Partial<WeeklyPlan> | null = null) => {
    if (plan) {
      setEditingPlan({ ...plan });
    } else {
      // Default new plan for teacher's own subject
      setEditingPlan({
        week: 1,
        grade: 'أول متوسط',
        subject: session?.subject || 'الرياضيات',
        title: '',
        objectives: '',
        homework: '',
        notes: '',
        teacherId: session?.teacherId,
        teacherName: session?.name
      });
    }
    setFormError('');
    setIsEditing(true);
  };

  // Close Editor
  const closeEditor = () => {
    setEditingPlan(null);
    setIsEditing(false);
    setFormError('');
  };

  // Handle Submit Form (Save plan)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editingPlan?.title?.trim()) {
      setFormError('الرجاء إدخال عنوان / موضوع الدرس لهذا الأسبوع');
      return;
    }

    setSubmittingForm(true);
    const success = await onSavePlan(editingPlan);
    if (success) {
      setIsEditing(false);
      setEditingPlan(null);
    } else {
      setFormError('حدث خطأ أثناء حفظ الخطة الأسبوعية. يرجى المحاولة لاحقاً.');
    }
    setSubmittingForm(false);
  };

  // Handle Delete Plan
  const handleDeleteClick = async (planId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخطة الأسبوعية؟')) {
      await onDeletePlan(planId);
    }
  };

  // Render Login state
  if (!session) {
    return (
      <div className="max-w-md mx-auto my-8 animate-fade-in space-y-6">
        
        {/* Helper info banner for trial */}
        {authMode === 'login' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>بيانات تجريبية للدخول السريع:</span>
            </div>
            <div className="space-y-1 font-medium text-right" dir="rtl">
              <div>• اسم المستخدم للمعلم: <span className="font-bold underline text-amber-950 font-mono">ahmed</span> (مادة الرياضيات)</div>
              <div>• اسم المستخدم للمعلم: <span className="font-bold underline text-amber-950 font-mono">khaled</span> (مادة العلوم)</div>
              <div>• اسم المستخدم للمعلم: <span className="font-bold underline text-amber-950 font-mono">ali</span> (مادة لغتي)</div>
              <div>• كلمة المرور لجميع الحسابات: <span className="font-bold text-amber-950 font-mono">123</span></div>
            </div>
          </div>
        )}

        {/* Login Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          
          {authMode === 'login' && (
            <>
              <div className="text-center space-y-2">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">تسجيل الدخول للمنصة</h2>
                <p className="text-xs text-slate-500">يرجى تسجيل الدخول للوصول لبوابة المعلمين أو إدارة المدرسة</p>
              </div>

              {/* Role Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => {
                    setLoginRole('teacher');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    loginRole === 'teacher'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  بوابة المعلمين
                </button>
                <button
                  onClick={() => {
                    setLoginRole('principal');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    loginRole === 'principal'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  إدارة المدرسة (المدير)
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">اسم المستخدم أو البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={loginRole === 'principal' ? 'principal' : 'مثال: ahmed أو البريد الإلكتروني'}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 pb-1 select-none">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 border-slate-300 focus:ring-emerald-500 accent-emerald-800 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="text-xs font-semibold text-slate-600 cursor-pointer">
                    تذكرني على هذا الجهاز (غير مستحسن للأجهزة المشتركة)
                  </label>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingLogin}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingLogin ? 'جاري التحقق...' : 'تسجيل الدخول'}
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </form>

              {/* Footer Links for Teacher Portal */}
              {loginRole === 'teacher' && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setRegisterError('');
                      setRegisterSuccessMessage('');
                    }}
                    className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
                  >
                    اشتراك معلم جديد
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('forgot');
                      setForgotError('');
                      setForgotSuccessMessage('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}
            </>
          )}

          {authMode === 'register' && (
            <>
              <div className="text-center space-y-2">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">اشتراك معلم جديد</h2>
                <p className="text-xs text-slate-500">قم بإنشاء حسابك الخاص للبدء برفع ومتابعة خططك الأسبوعية</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">الاسم كامل</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="أ. محمد الحربي"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="teacher@school.com"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white ltr"
                      style={{ textAlign: 'right' }}
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">المادة الدراسية</label>
                  <div className="relative">
                    <select
                      value={registerSubject}
                      onChange={(e) => setRegisterSubject(e.target.value as Subject)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer appearance-none"
                    >
                      <option value="الرياضيات">الرياضيات</option>
                      <option value="العلوم">العلوم</option>
                      <option value="اللغة الإنجليزية">اللغة الإنجليزية</option>
                      <option value="لغتي">لغتي</option>
                      <option value="الدراسات الإسلامية">الدراسات الإسلامية</option>
                      <option value="الدراسات الاجتماعية">الدراسات الاجتماعية</option>
                      <option value="المهارات الرقمية">المهارات الرقمية</option>
                      <option value="التربية البدنية">التربية البدنية</option>
                      <option value="التربية الأسرية">التربية الأسرية</option>
                      <option value="التفكير الناقد">التفكير الناقد</option>
                    </select>
                    <BookOpen className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">الرقم السري (كلمة المرور)</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {registerError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                {registerSuccessMessage && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-100 animate-pulse">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{registerSuccessMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingRegister}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingRegister ? 'جاري الاشتراك...' : 'تسجيل الاشتراك وتفعيل الحساب'}
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-4 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  لديك حساب بالفعل؟ العودة لتسجيل الدخول
                </button>
              </div>
            </>
          )}

          {authMode === 'forgot' && (
            <>
              <div className="text-center space-y-2">
                <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">استرجاع الرقم السري</h2>
                <p className="text-xs text-slate-500">أدخل بريدك الإلكتروني المسجل وسنقوم باسترجاع رقمك السري فوراً</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="teacher@school.com"
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white ltr"
                      style={{ textAlign: 'right' }}
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccessMessage && (
                  <div className="bg-emerald-50 text-emerald-900 text-xs font-bold p-4 rounded-xl border border-emerald-100 space-y-2 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-800">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>تم التحقق من الحساب بنجاح</span>
                    </div>
                    <div className="text-base bg-white p-2.5 rounded-lg border border-emerald-200 font-mono tracking-widest text-emerald-950 font-bold">
                      {forgotSuccessMessage}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingForgot}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingForgot ? 'جاري الاسترجاع...' : 'استرجاع الرقم السري'}
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-4 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  العودة لصفحة تسجيل الدخول
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  // Render Logged in Teacher view
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Teacher Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-800 shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{session.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                مدرس مادة: {session.subject}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                مدرسة متوسطة عمرو بن العاص
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openEditor()}
            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة خطة أسبوعية
          </button>
          <button
            onClick={onLogout}
            className="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج
          </button>
        </div>
      </div>

      {/* Editor Modal/Block */}
      {isEditing && editingPlan && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-emerald-700" />
              {editingPlan.id ? 'تعديل الخطة الأسبوعية المرفوعة' : 'إضافة خطة أسبوعية جديدة للفصل'}
            </h3>
            <button
              onClick={closeEditor}
              className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Select Grade */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">الصف الدراسي</label>
                <select
                  value={editingPlan.grade}
                  onChange={(e) => setEditingPlan({ ...editingPlan, grade: e.target.value as Grade })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                >
                  <option value="أول متوسط">أول متوسط</option>
                  <option value="ثاني متوسط">ثاني متوسط</option>
                  <option value="ثالث متوسط">ثالث متوسط</option>
                </select>
              </div>

              {/* Select Week */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">أسبوع الفصل الدراسي</label>
                <select
                  value={editingPlan.week}
                  onChange={(e) => setEditingPlan({ ...editingPlan, week: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 font-mono text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                >
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
                    <option key={week} value={week}>الأسبوع {week}</option>
                  ))}
                </select>
              </div>

              {/* Subject (Locked for teacher safety) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">المادة الدراسية</label>
                <input
                  type="text"
                  value={editingPlan.subject}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 text-xs text-slate-500 rounded-xl px-3 py-2.5 text-right"
                />
              </div>

            </div>

            {/* Lesson Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">موضوع / عنوان الدرس لهذا الأسبوع *</label>
              <input
                type="text"
                value={editingPlan.title || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                placeholder="مثال: الخطوات الأربع لحل المسألة الرياضية"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Objectives */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">الأهداف والأنشطة التعليمية</label>
              <textarea
                value={editingPlan.objectives || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, objectives: e.target.value })}
                placeholder="ادخل الأهداف الرئيسية للحصص في نقاط منفصلة..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Homework */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">الواجب المدرسي والتكليفات المنزلية</label>
              <textarea
                value={editingPlan.homework || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, homework: e.target.value })}
                placeholder="مثال: حل تدريبات ص ١٥ في كتاب الطالب..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">تنبيهات وملاحظات إضافية لأولياء الأمور</label>
              <textarea
                value={editingPlan.notes || ''}
                onChange={(e) => setEditingPlan({ ...editingPlan, notes: e.target.value })}
                placeholder="مثال: الرجاء إحضار الأدوات الهندسية اللازمة للحصة..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* File Attachment Upload */}
            <div className="space-y-1.5 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-700 block">إرفاق نسخة الخطة الأسبوعية (صورة أو ملف PDF) اختيارى</label>
              
              {!editingPlan.attachmentUrl ? (
                <div className="relative group border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 transition-all duration-150 bg-slate-50 hover:bg-emerald-50/20 text-center">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={uploadingFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="space-y-1">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 transition-all duration-150">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-600 font-bold">
                      {uploadingFile ? 'جاري رفع الملف...' : 'اضغط لرفع الخطة الأسبوعية كصورة أو ملف PDF'}
                    </div>
                    <p className="text-[10px] text-slate-400">الحد الأقصى لحجم الملف: ١٠ ميجابايت (PNG, JPG, JPEG, PDF)</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="text-right overflow-hidden">
                      <p className="text-xs font-bold text-slate-700 truncate" title={editingPlan.attachmentName}>
                        {editingPlan.attachmentName || 'ملف الخطة الأسبوعية'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold capitalize">
                        {editingPlan.attachmentType === 'pdf' ? 'مستند PDF' : 'صورة الخطة'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <a
                      href={editingPlan.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      معاينة
                    </a>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="text-[11px] text-red-650 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeEditor}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                type="submit"
                disabled={submittingForm}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {submittingForm ? 'جاري الحفظ...' : 'حفظ الخطة الأسبوعية'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher's Plans List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 px-1">
          خططك الأسبوعية المرفوعة ({teacherPlans.length})
        </h3>

        {teacherPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {teacherPlans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      الأسبوع {plan.week} • {plan.grade}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      <CheckCircle className="w-3 h-3" />
                      مكتملة
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {plan.title}
                    </h4>
                  </div>

                  {plan.attachmentUrl && (
                    <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg text-slate-700 transition-all duration-150">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <a 
                        href={plan.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-bold truncate hover:underline flex-1 text-right"
                      >
                        {plan.attachmentName || 'عرض ملف الخطة المرفق'}
                      </a>
                    </div>
                  )}

                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    {plan.objectives && (
                      <div>
                        <span className="font-bold text-slate-700 text-[10px]">الأهداف:</span>
                        <p className="line-clamp-2 leading-relaxed bg-slate-50/50 p-1.5 rounded text-[10px] mt-0.5">{plan.objectives}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">
                    {new Date(plan.updatedAt).toLocaleDateString('ar-SA')}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditor(plan)}
                      className="bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-950 p-1.5 rounded transition-all"
                      title="تعديل"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(plan.id)}
                      className="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 p-1.5 rounded transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center space-y-4 max-w-sm mx-auto">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800">لم تقم برفع أي خطة أسبوعية حتى الآن</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اضغط على الزر أدناه لإضافة أول خطة دروس ليطلع عليها أولياء الأمور والمدير.
              </p>
            </div>
            <button
              onClick={() => openEditor()}
              className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all duration-200 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة أول خطة
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
