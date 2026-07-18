import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, CheckCircle, AlertCircle, Calendar, Users, 
  BookOpen, BarChart3, ChevronLeft, Lock, ArrowLeft, RefreshCw, Layers,
  Paperclip, Settings, X, Mail, User
} from 'lucide-react';
import { Grade, Subject, WeeklyPlan, UserSession, WeekStats } from '../types';

interface PrincipalDashboardProps {
  plans: WeeklyPlan[];
  session: UserSession | null;
  onLogin: (credentials: any) => Promise<boolean>;
  onLogout: () => void;
  loading: boolean;
  onRefresh: () => void;
}

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

const GRADES: Grade[] = ['أول متوسط', 'ثاني متوسط', 'ثالث متوسط'];

// Default teacher assignment mapping for missing alerts
const SUBJECT_TEACHER_MAPPING: Record<Subject, string> = {
  'الرياضيات': 'أ. أحمد الحربي',
  'العلوم': 'أ. خالد الغامدي',
  'اللغة الإنجليزية': 'أ. محمد القحطاني',
  'لغتي': 'أ. علي الشمراني',
  'الدراسات الإسلامية': 'أ. يوسف السهلي',
  'الدراسات الاجتماعية': 'أ. عبد الرحمن العتيبي',
  'المهارات الرقمية': 'أ. فهد المطيري',
  'التربية البدنية': 'أ. ياسر الزهراني',
  'التربية الأسرية': 'أ. صالح البلوي',
  'التفكير الناقد': 'أ. ناصر الدوسري'
};

export default function PrincipalDashboard({
  plans,
  session,
  onLogin,
  onLogout,
  loading,
  onRefresh
}: PrincipalDashboardProps) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Auth & Settings States
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [forgotEmailOrUser, setForgotEmailOrUser] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch current settings for Settings Modal
  const loadPrincipalSettings = async () => {
    try {
      const response = await fetch('/api/principal/settings');
      if (response.ok) {
        const data = await response.json();
        setSettingsUsername(data.username || '');
        setSettingsEmail(data.email || '');
        setSettingsPassword(''); // Keep blank or prompt
      }
    } catch (err) {
      console.error('Error fetching principal settings:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!settingsUsername.trim()) {
      setSettingsError('اسم المستخدم مطلوب');
      return;
    }
    if (!settingsPassword.trim()) {
      setSettingsError('الرجاء إدخال كلمة مرور لتأكيد التحديث أو وضع كلمة مرور جديدة');
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch('/api/principal/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: settingsUsername,
          password: settingsPassword,
          email: settingsEmail
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تحديث البيانات');
      }

      setSettingsSuccess('تم تحديث بيانات الحساب بنجاح!');
      setTimeout(() => {
        setShowSettingsModal(false);
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err: any) {
      setSettingsError(err.message || 'حدث خطأ أثناء تحديث البيانات');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmailOrUser.trim()) {
      setForgotError('الرجاء إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    setSubmittingForgot(true);
    try {
      const response = await fetch('/api/principal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: forgotEmailOrUser })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'لم يتم العثور على حساب مدير المدرسة');
      }

      setForgotSuccess(`تم استرجاع الرقم السري بنجاح! كلمة المرور هي: ( ${data.password} )`);
    } catch (err: any) {
      setForgotError(err.message || 'حدث خطأ أثناء الاسترجاع');
    } finally {
      setSubmittingForgot(false);
    }
  };

  // Active highlighted week for detailed view
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Stats State
  const [stats, setStats] = useState<WeekStats[]>([]);
  const [summary, setSummary] = useState({ totalUploaded: 0, totalExpected: 0, percentage: 0 });

  // Calculate statistics from current plans
  useEffect(() => {
    const expectedPerWeek = SUBJECTS.length * GRADES.length; // 30 plans
    const calculatedStats: WeekStats[] = [];
    
    for (let w = 1; w <= 18; w++) {
      const weekPlans = plans.filter(p => p.week === w);
      calculatedStats.push({
        week: w,
        uploadedCount: weekPlans.length,
        expectedCount: expectedPerWeek,
        percentage: Math.round((weekPlans.length / expectedPerWeek) * 100)
      });
    }

    const totalUploaded = plans.length;
    const totalExpected = expectedPerWeek * 18; // 540
    const percentage = Math.round((totalUploaded / totalExpected) * 100);

    setStats(calculatedStats);
    setSummary({ totalUploaded, totalExpected, percentage });
  }, [plans]);

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

    const success = await onLogin({ username, password, role: 'principal', rememberMe });
    if (!success) {
      setLoginError('فشل الدخول: اسم المستخدم أو كلمة المرور للمدير غير صحيحة');
    }
    setSubmittingLogin(false);
  };

  // Helper to check plan status in the matrix
  const getMatrixCell = (subject: Subject, grade: Grade, week: number) => {
    return plans.find(p => p.week === week && p.grade === grade && p.subject === subject);
  };

  // Login Gate
  if (!session || session.role !== 'principal') {
    return (
      <div className="max-w-md mx-auto my-8 animate-fade-in space-y-6">
        
        {/* Info Box */}
        {authMode === 'login' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              بيانات تجريبية لدخول الإدارة:
            </span>
            <div className="font-mono text-right" dir="rtl">
              <div>• اسم المستخدم: <span className="font-bold underline text-amber-950">principal</span></div>
              <div>• كلمة المرور: <span className="font-bold underline text-amber-950">admin123</span></div>
            </div>
          </div>
        )}

        {/* Login Form Card */}
        {authMode === 'login' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">لوحة الإدارة والمتابعة للمدير</h2>
              <p className="text-xs text-slate-500">خاص بمدير مدرسة عمرو بن العاص المتوسطة لمتابعة إعداد الخطط</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">اسم المستخدم للمدير</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="principal"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">كلمة المرور الخاصة بالإدارة</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 pb-1 select-none">
                <input
                  type="checkbox"
                  id="principal-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 border-slate-300 focus:ring-emerald-500 accent-emerald-800 cursor-pointer"
                />
                <label htmlFor="principal-remember-me" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  تذكرني على هذا الجهاز (غير مستحسن للأجهزة المشتركة)
                </label>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submittingLogin ? 'جاري التحقق...' : 'دخول الإدارة'}
                <ChevronLeft className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  setAuthMode('forgot');
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
              >
                نسيت كلمة المرور الخاصة بالإدارة؟
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Card */}
        {authMode === 'forgot' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-800">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">استرجاع الرقم السري للمدير</h2>
              <p className="text-xs text-slate-500">الرجاء إدخال اسم المستخدم أو البريد الإلكتروني للمدير لاستعادة الرقم السري</p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">اسم المستخدم أو البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="text"
                    value={forgotEmailOrUser}
                    onChange={(e) => setForgotEmailOrUser(e.target.value)}
                    placeholder="principal"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              {forgotError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-emerald-50 text-emerald-900 text-xs font-bold p-4 rounded-xl border border-emerald-100 space-y-2 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>تم التحقق من حساب المدير</span>
                  </div>
                  <div className="text-base bg-white p-2.5 rounded-lg border border-emerald-200 font-mono tracking-widest text-emerald-950 font-bold">
                    {forgotSuccess}
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
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Principal Dashboard Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-800" />
            لوحة الإشراف والمتابعة للمدير
          </h2>
          <p className="text-xs text-slate-500 mt-1">تتبع الخطط الأسبوعية المرفوعة ونسب إنجاز الهيئة التعليمية ومستويات الالتزام</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadPrincipalSettings();
              setShowSettingsModal(true);
            }}
            className="px-3.5 h-10 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <Settings className="w-4 h-4 animate-spin-hover" />
            إعدادات الحساب
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </button>
          <button
            onClick={onLogout}
            className="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-3.5 h-10 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            خروج
          </button>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Progress Circular/Gauge equivalent */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Simple Progress Ring */}
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold font-mono text-base border-4 border-emerald-600 shadow-inner">
              {summary.percentage}%
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">نسبة الالتزام الإجمالية</span>
            <h3 className="text-sm font-bold text-slate-800">إنجاز الفصل الدراسي</h3>
            <p className="text-[10px] text-slate-400">لجميع الأسابيع والصفوف الدراسية</p>
          </div>
        </div>

        {/* Card 2: Uploaded counts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">إجمالي الخطط المرفوعة</span>
            <h3 className="text-sm font-bold text-slate-800">{summary.totalUploaded} خطة</h3>
            <p className="text-[10px] text-slate-400">تم اعتمادها ونشرها لأولياء الأمور</p>
          </div>
        </div>

        {/* Card 3: Expected counts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">إجمالي الخطط المطلوبة</span>
            <h3 className="text-sm font-bold text-slate-800">{summary.totalExpected} خطة</h3>
            <p className="text-[10px] text-slate-400">لكافة التخصصات (١٠ مواد × ٣ صفوف × ١٨ أسبوعاً)</p>
          </div>
        </div>

      </div>

      {/* Week Progress Graph / Chart list */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-emerald-800" />
            نسبة إنجاز المعلمين حسب الأسبوع (١٨ أسبوعاً)
          </h3>
          <span className="text-[10px] text-slate-400">اختر أسبوعاً للاطلاع على تفاصيل تسليم المعلمين</span>
        </div>

        {/* simple grid for Weeks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {stats.map((weekStat) => {
            // Determine color based on completion
            let barColor = 'bg-rose-500';
            let textColor = 'text-rose-700';
            if (weekStat.percentage >= 80) {
              barColor = 'bg-emerald-600';
              textColor = 'text-emerald-700';
            } else if (weekStat.percentage >= 40) {
              barColor = 'bg-amber-500';
              textColor = 'text-amber-700';
            }

            const isSelected = selectedWeek === weekStat.week;

            return (
              <button
                key={weekStat.week}
                onClick={() => setSelectedWeek(weekStat.week)}
                className={`p-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200/50 scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-[9px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  الأسبوع
                </div>
                <div className="text-sm font-bold font-mono mt-0.5">{weekStat.week}</div>
                
                {/* Visual Tiny Progress Bar */}
                <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${isSelected ? 'bg-amber-400' : barColor}`}
                    style={{ width: `${weekStat.percentage}%` }}
                  ></div>
                </div>

                <div className={`text-[9px] font-bold font-mono mt-1.5 ${
                  isSelected ? 'text-amber-200' : textColor
                }`}>
                  {weekStat.percentage}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Submission Matrix for Selected Week */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-emerald-800" />
              مصفوفة تسليم الخطط الدراسية - الأسبوع {selectedWeek}
            </h3>
            <p className="text-[11px] text-slate-500">متابعة حالة تسليم كل مادة دراسية للصفوف الثلاثة في الأسبوع {selectedWeek}</p>
          </div>

          <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700">
            الخطط المكتملة: {stats.find(s => s.week === selectedWeek)?.uploadedCount || 0} من ٣٠
          </div>
        </div>

        {/* Interactive Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-48">المادة الدراسية</th>
                <th className="py-3 px-4 text-center">أول متوسط</th>
                <th className="py-3 px-4 text-center">ثاني متوسط</th>
                <th className="py-3 px-4 text-center">ثالث متوسط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {SUBJECTS.map((subject) => {
                const responsibleTeacher = SUBJECT_TEACHER_MAPPING[subject];

                return (
                  <tr key={subject} className="hover:bg-slate-50/50 transition-all">
                    {/* Subject Name */}
                    <td className="py-3 px-4 font-bold text-slate-800 flex flex-col gap-0.5">
                      <span>{subject}</span>
                      <span className="text-[9px] text-slate-400 font-normal">المشرف: {responsibleTeacher}</span>
                    </td>

                    {/* Matrix Cells for Grades */}
                    {GRADES.map((grade) => {
                      const plan = getMatrixCell(subject, grade, selectedWeek);
                      return (
                        <td key={grade} className="py-3 px-4 text-center">
                          {plan ? (
                            <div className="inline-flex flex-col items-center p-2 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-100/60 max-w-[180px] w-full mx-auto space-y-1">
                              <span className="font-bold text-[9px] leading-none flex items-center gap-1 text-emerald-700">
                                <CheckCircle className="w-3 h-3" />
                                تم الرفع
                              </span>
                              <span className="text-[10px] font-bold truncate w-full text-slate-800" title={plan.title}>
                                {plan.title}
                              </span>
                              <span className="text-[9px] text-slate-400">بواسطة {plan.teacherName}</span>
                              {plan.attachmentUrl && (
                                <a 
                                  href={plan.attachmentUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[8px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded font-bold transition-all mt-1"
                                  title={plan.attachmentName}
                                >
                                  <Paperclip className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                                  عرض المرفق
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-200/50 max-w-[180px] w-full mx-auto space-y-1">
                              <span className="font-bold text-[9px] leading-none flex items-center gap-1 text-slate-400">
                                <AlertCircle className="w-3 h-3" />
                                لم ترفع
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">
                                المطلوب: {responsibleTeacher}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-800" />
                إعدادات حساب المدير
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">اسم المستخدم للمدير</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settingsUsername}
                    onChange={(e) => setSettingsUsername(e.target.value)}
                    placeholder="اسم المستخدم"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني للاسترجاع</label>
                <div className="relative">
                  <input
                    type="email"
                    value={settingsEmail}
                    onChange={(e) => setSettingsEmail(e.target.value)}
                    placeholder="principal@school.com"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 block">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور جديدة أو للتأكيد"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {settingsError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {savingSettings ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
