import React, { useState, useEffect } from 'react';
import { WeeklyPlan, UserSession } from './types';
import Header from './components/Header';
import ParentView from './components/ParentView';
import TeacherPortal from './components/TeacherPortal';
import PrincipalDashboard from './components/PrincipalDashboard';
import { School, CheckCircle, AlertCircle, RefreshCw, Layers, Award } from 'lucide-react';

export default function App() {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentView, setView] = useState<'parent' | 'teacher' | 'principal'>('parent');
  
  // Manage user session
  const [session, setSession] = useState<UserSession | null>(() => {
    const sessionSaved = sessionStorage.getItem('school_session');
    if (sessionSaved) return JSON.parse(sessionSaved);
    const localSaved = localStorage.getItem('school_session');
    if (localSaved) {
      // Set in sessionStorage for the current tab consistency
      sessionStorage.setItem('school_session', localSaved);
      return JSON.parse(localSaved);
    }
    return null;
  });

  // Fetch all plans
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        console.error('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch plans and auto-navigate if logged in
  useEffect(() => {
    fetchPlans();
    if (session) {
      if (session.role === 'principal') {
        setView('principal');
      } else if (session.role === 'teacher') {
        setView('teacher');
      }
    }
  }, [session]);

  // Handle Login
  const handleLogin = async (credentials: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.session) {
          setSession(result.session);
          
          // Store session with absolute tab independence (sessionStorage)
          const sessionStr = JSON.stringify(result.session);
          sessionStorage.setItem('school_session', sessionStr);
          
          // Only save persistently in localStorage if "Remember Me" is checked
          if (credentials.rememberMe) {
            localStorage.setItem('school_session', sessionStr);
          } else {
            localStorage.removeItem('school_session');
          }
          
          // Switch to appropriate view on successful login
          if (result.session.role === 'principal') {
            setView('principal');
          } else if (result.session.role === 'teacher') {
            setView('teacher');
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('school_session');
    localStorage.removeItem('school_session');
    setView('parent'); // Reset to parent view
  };

  // Save Plan (Create/Update)
  const handleSavePlan = async (planData: Partial<WeeklyPlan>): Promise<boolean> => {
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        await fetchPlans(); // Reload all plans from server
        return true;
      }
      return false;
    } catch (error) {
      console.error('Save plan error:', error);
      return false;
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPlans(); // Reload all plans
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete plan error:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      
      {/* Branding and Nav Header */}
      <Header 
        currentView={currentView} 
        setView={setView} 
        session={session} 
        onLogout={handleLogout} 
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Dynamic View rendering */}
        {currentView === 'parent' && (
          <ParentView plans={plans} loading={loading} />
        )}

        {currentView === 'teacher' && (
          <TeacherPortal 
            plans={plans}
            session={session}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}

        {currentView === 'principal' && (
          <PrincipalDashboard 
            plans={plans}
            session={session}
            onLogin={handleLogin}
            onLogout={handleLogout}
            loading={loading}
            onRefresh={fetchPlans}
          />
        )}

      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold">
            <School className="w-5 h-5 text-amber-500" />
            <span>مدرسة عمرو بن العاص المتوسطة بالرياض</span>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed">
            جميع الحقوق محفوظة © {new Date().getFullYear()} مدرسة عمرو بن العاص المتوسطة
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-slate-400">
            <a 
              href="https://x.com/Fnar9595" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-700 hover:underline transition-all duration-150 font-bold"
            >
              فكرة و تطوير الاستاذ فاضل المبارك  تابعوني على تويتر
            </a>
            <span>•</span>
            <span>نظام الخطط المدرسية المتكامل</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
