import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, FlaskConical, Languages, Heart, Globe, 
  Cpu, Activity, Users, HelpCircle, Calendar, Sparkles, Clock, AlertCircle, X, ChevronLeft, ArrowRight, FileText,
  Paperclip
} from 'lucide-react';
import { Grade, Subject, WeeklyPlan } from '../types';

interface ParentViewProps {
  plans: WeeklyPlan[];
  loading: boolean;
}

const SUBJECTS_CONFIG: { name: Subject; icon: React.ComponentType<any>; tagText: string; tagBg: string; tagTextClass: string }[] = [
  { name: 'الرياضيات', icon: Calculator, tagText: 'علمي', tagBg: 'bg-blue-100', tagTextClass: 'text-blue-700' },
  { name: 'العلوم', icon: FlaskConical, tagText: 'طبيعي', tagBg: 'bg-emerald-100', tagTextClass: 'text-emerald-700' },
  { name: 'اللغة الإنجليزية', icon: Languages, tagText: 'لغات', tagBg: 'bg-indigo-100', tagTextClass: 'text-indigo-700' },
  { name: 'لغتي', icon: BookOpen, tagText: 'أدبي', tagBg: 'bg-red-100', tagTextClass: 'text-red-700' },
  { name: 'الدراسات الإسلامية', icon: Sparkles, tagText: 'ديني', tagBg: 'bg-amber-100', tagTextClass: 'text-amber-700' },
  { name: 'الدراسات الاجتماعية', icon: Globe, tagText: 'عام', tagBg: 'bg-purple-100', tagTextClass: 'text-purple-700' },
  { name: 'المهارات الرقمية', icon: Cpu, tagText: 'تقني', tagBg: 'bg-cyan-100', tagTextClass: 'text-cyan-700' },
  { name: 'التربية البدنية', icon: Activity, tagText: 'نشاط', tagBg: 'bg-rose-100', tagTextClass: 'text-rose-700' },
  { name: 'التربية الأسرية', icon: Heart, tagText: 'حياتي', tagBg: 'bg-pink-100', tagTextClass: 'text-pink-700' },
  { name: 'التفكير الناقد', icon: HelpCircle, tagText: 'تطويري', tagBg: 'bg-violet-100', tagTextClass: 'text-violet-700' }
];

export default function ParentView({ plans, loading }: ParentViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<Grade>('أول متوسط');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlanDetails, setActivePlanDetails] = useState<WeeklyPlan | null>(null);

  // Auto-scroll current week to view in horizontal scroll
  useEffect(() => {
    const el = document.getElementById(`week-btn-${selectedWeek}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedWeek]);

  // Find a plan for a given subject
  const getPlanForSubject = (subjectName: Subject): WeeklyPlan | undefined => {
    return plans.find(
      (p) => p.grade === selectedGrade && p.week === selectedWeek && p.subject === subjectName
    );
  };

  const filteredSubjects = SUBJECTS_CONFIG.filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Grade Selection Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          
          {/* Grade Picker */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 block">الفئة المستهدفة:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200/50">
              {(['أول متوسط', 'ثاني متوسط', 'ثحد متوسط'] as string[]).map((gradePlaceholder) => {
                const grade: Grade = gradePlaceholder === 'ثحد متوسط' ? 'ثالث متوسط' : (gradePlaceholder as Grade);
                return (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all duration-250 ${
                      selectedGrade === grade
                        ? 'bg-white text-emerald-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info & Search */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-md w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث عن مادة دراسية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-4 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-900 px-4 py-2.5 rounded-xl border border-emerald-100">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold">الفصل الدراسي الأول ١٤٤٨هـ</span>
            </div>
          </div>

        </div>
      </div>

      {/* 18 Weeks Slider */}
      <nav className="bg-slate-100 p-3 flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 shrink-0 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 px-3 shrink-0">الأسبوع:</span>
        <div className="flex gap-1 items-center">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
            const isSelected = selectedWeek === week;
            return (
              <button
                key={week}
                id={`week-btn-${week}`}
                onClick={() => setSelectedWeek(week)}
                className={`px-3.5 h-8 flex items-center justify-center rounded text-xs font-bold transition-all duration-150 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200/50'
                    : 'bg-white text-slate-400 hover:text-slate-700 border border-slate-200/60 shadow-sm hover:border-slate-300'
                }`}
              >
                {week < 10 ? `0${week}` : week}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Plans Layout Grid (Desktop 5-column, Tablet 3-column, Mobile 1-column) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
          <p className="text-xs text-slate-500">جاري تحميل الخطط الأسبوعية...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSubjects.map((sub) => {
            const plan = getPlanForSubject(sub.name);
            const Icon = sub.icon;

            if (plan) {
              return (
                <div 
                  key={sub.name}
                  onClick={() => setActivePlanDetails(plan)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-emerald-500 transition-all duration-200 cursor-pointer group hover:shadow-md"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`${sub.tagBg} ${sub.tagTextClass} text-[10px] font-bold px-2 py-0.5 rounded`}>
                        {sub.tagText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {plan.attachmentUrl && (
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="يحتوي على ملف مرفق (صورة أو PDF)" />
                        )}
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" title="تم رفع الخطة"></div>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-emerald-800 transition-colors">{sub.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1.5 h-8">
                      {plan.title}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>{plan.teacherName}</span>
                    <span className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
                      التفاصيل
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            } else {
              return (
                <div 
                  key={sub.name}
                  className="bg-white p-4 rounded-xl border border-dashed border-slate-200 flex flex-col justify-between opacity-80"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded">
                        {sub.tagText}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200" title="بانتظار رفع الخطة"></div>
                    </div>
                    <h3 className="font-bold text-slate-400 text-sm mb-1">{sub.name}</h3>
                    <p className="text-[11px] text-slate-400 italic mt-2">
                      بانتظار رفع الخطة من المعلم
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100/50">
                    <p className="text-[10px] text-slate-300">لم تنشر خطة بعد</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Plan Details Modal */}
      {activePlanDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActivePlanDetails(null)}>
          <div 
            className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header with subject custom tag color style */}
            <div className="bg-emerald-900 text-white p-6 relative">
              <button 
                onClick={() => setActivePlanDetails(null)}
                className="absolute left-6 top-6 text-emerald-100 hover:text-white bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    الأسبوع {activePlanDetails.week} • {activePlanDetails.grade}
                  </span>
                  <span className="bg-white/15 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    مادة {activePlanDetails.subject}
                  </span>
                </div>
                <h3 className="text-lg font-bold pt-2">{activePlanDetails.title}</h3>
                <p className="text-xs text-emerald-200/80">المعلم المرفق: {activePlanDetails.teacherName}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Objectives */}
              {activePlanDetails.objectives && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    الأهداف التعليمية والأنشطة للحصة الدراسية:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl whitespace-pre-line border border-slate-100">
                    {activePlanDetails.objectives}
                  </p>
                </div>
              )}

              {/* Homework */}
              {activePlanDetails.homework && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5 border-r-2 border-amber-500 pr-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    الواجبات والتكليفات المنزلية المطلوبة:
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-4 rounded-2xl whitespace-pre-line border border-amber-100/60 font-medium">
                    {activePlanDetails.homework}
                  </p>
                </div>
              )}

              {/* Notes */}
              {activePlanDetails.notes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 border-r-2 border-rose-500 pr-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    ملاحظات وتوجيهات هامة لأولياء الأمور:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/30 p-4 rounded-2xl whitespace-pre-line border border-rose-100/40">
                    {activePlanDetails.notes}
                  </p>
                </div>
              )}

              {/* Attachment */}
              {activePlanDetails.attachmentUrl && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-emerald-850 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    نسخة الخطة المرفقة:
                  </h4>
                  
                  {activePlanDetails.attachmentType === 'image' ? (
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-2 rounded-2xl overflow-hidden border border-slate-200">
                        <img 
                          src={activePlanDetails.attachmentUrl} 
                          alt={activePlanDetails.attachmentName || 'صورة الخطة الأسبوعية'} 
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[300px] object-contain mx-auto rounded-xl"
                        />
                      </div>
                      <div className="text-center">
                        <a 
                          href={activePlanDetails.attachmentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          فتح الصورة في صفحة جديدة
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-red-50/30 border border-red-100 rounded-2xl">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2.5 bg-red-100 text-red-800 rounded-xl shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-right overflow-hidden">
                          <p className="text-xs font-bold text-slate-700 truncate" title={activePlanDetails.attachmentName}>
                            {activePlanDetails.attachmentName || 'مستند الخطة الأسبوعية.pdf'}
                          </p>
                          <p className="text-[10px] text-red-700 font-bold">ملف مستند PDF</p>
                        </div>
                      </div>
                      
                      <a 
                        href={activePlanDetails.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold bg-white hover:bg-red-50/50 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        عرض وتحميل الملف
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>تاريخ نشر الخطة الدراسية:</span>
              <span className="font-mono font-bold">
                {new Date(activePlanDetails.updatedAt).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend status indicators */}
      <div className="bg-white border border-slate-200 px-6 py-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>مكتمل ومتاح للاطلاع</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span>لم يرفع من المعلم بعد</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          * لمشاهدة تفاصيل الدروس والواجبات والملاحظات بشكل كامل، اضغط على بطاقة المادة.
        </p>
      </div>

    </div>
  );
}
