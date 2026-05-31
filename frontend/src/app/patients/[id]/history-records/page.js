'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock, AlertCircle, ClipboardList } from 'lucide-react';

export default function PatientHistoryRecords() {
  const { user, token, API_BASE_URL } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Navigation Guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // Fetch patient data including appointments (clinical history)
  useEffect(() => {
    if (!patientId || !token) return;

    const fetchPatientHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch patient records.');
        }

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientHistory();
  }, [patientId, token]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8">

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="pulse-loader">
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-400">Loading patient records...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Patient Data */}
        {!loading && patient && (
          <div className="space-y-6">

            {/* Patient Header Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                    {patient.name}
                  </h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {patient.gender} · {patient.age} yrs · {patient.phoneNumber}
                    {patient.email && ` · ${patient.email}`}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-extrabold uppercase tracking-wide border border-teal-500/20">
                  Patient ID #{patient.id}
                </span>
              </div>
            </div>

            {/* Medical History Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-teal-600" />
                Clinical Background / Medical History
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm">
                {/* Safe null check — medicalHistory can be null */}
                {patient.medicalHistory ? (
                  <p className="text-slate-700 dark:text-slate-300 leading-6 font-medium">
                    {patient.medicalHistory}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">
                    No clinical history has been recorded for this patient.
                  </p>
                )}
              </div>
            </div>

            {/* Appointment History Card */}
            <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                Diagnostic Appointment Records
              </h2>

              {patient.appointments && patient.appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-widest text-xs font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3">Date & Time</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patient.appointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-500/5 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(appt.appointmentDate).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                            {appt.reason || 'No reason provided'}
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-extrabold tracking-wide uppercase 
                              ${appt.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : 
                                appt.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' : 
                                'bg-amber-500/10 text-amber-500'}`}>
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-100 dark:bg-slate-800/40 rounded-xl text-slate-400 text-sm font-semibold border border-dashed border-slate-200 dark:border-slate-700">
                  No appointment records found for this patient.
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}