import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  FileCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useLIS } from '../context/LISContext';
import { StaffMember, UserRole } from '../types/lis';

export const StaffView: React.FC = () => {
  const { currentLab, staffList, addStaffMember, toggleStaffStatus, currentRole } = useLIS();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('lab_scientist');
  const [department, setDepartment] = useState('Haematology');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    addStaffMember({
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      department,
      licenseNumber: licenseNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      isActive: true,
    });

    setIsModalOpen(false);
    setFullName('');
    setEmail('');
    setLicenseNumber('');
    setPhone('');
  };

  const roleDescriptions: Record<UserRole, { title: string; color: string; desc: string }> = {
    super_admin: {
      title: 'Super Administrator',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Global control, multi-tenant workspace provisioning, complete audit inspection.',
    },
    lab_admin: {
      title: 'Laboratory Administrator',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Operational management, staff onboarding, department and test catalogue governance.',
    },
    pathologist: {
      title: 'Consultant Pathologist',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Authorized clinical reviewer, official digital sign-off, diagnostic amendments.',
    },
    lab_supervisor: {
      title: 'Laboratory Supervisor',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Technical oversight, QC validation, result review, and correction dispatch.',
    },
    lab_scientist: {
      title: 'Medical Laboratory Scientist (MLS)',
      color: 'bg-sky-100 text-sky-800 border-sky-200',
      desc: 'Specimen accessioning, bench analytical runs, dynamic result entry.',
    },
    receptionist: {
      title: 'Receptionist / Phlebotomist',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Patient registration, diagnostic order booking, specimen collection & tube labeling.',
    },
    accountant: {
      title: 'Billing Accountant',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Invoicing, payment clearing, discounts, receivables management.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-teal-700" />
            Laboratory Staff & Role-Based Permissions (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage laboratory personnel, MLSCN/MDCN medical licenses, operational credentials, and role authorizations for {currentLab.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Staff Member
        </button>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Registered Staff Roster ({staffList.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Tenant: {currentLab.code}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Privilege</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Professional License</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {staffList.map((staff) => {
                const roleInfo = roleDescriptions[staff.role];

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{staff.fullName}</p>
                      <p className="text-[11px] text-slate-500">{staff.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${roleInfo.color}`}
                      >
                        {roleInfo.title}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {staff.department || 'General Bench'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {staff.licenseNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {staff.phone || '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          staff.isActive ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}
                        />
                        {staff.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleStaffStatus(staff.id)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100"
                      >
                        {staff.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Permissions Reference Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-700" />
          Clinical Laboratory Role Governance Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.entries(roleDescriptions).map(([roleKey, info]) => (
            <div
              key={roleKey}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${info.color} mb-1.5`}>
                  {info.title}
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{info.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Onboard New Laboratory Personnel</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Qualifications <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ngozi Balogun, FMCPath"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@laboratory.ng"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden capitalize"
                  >
                    <option value="lab_scientist">Lab Scientist</option>
                    <option value="lab_supervisor">Lab Supervisor</option>
                    <option value="pathologist">Consultant Pathologist</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="accountant">Accountant</option>
                    <option value="lab_admin">Lab Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Haematology, Chemistry, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Council License # (MLSCN/MDCN)
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. MLSCN/SCI/1042"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
