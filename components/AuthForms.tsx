import React, { useState } from 'react';
import { Role, User } from '../types';
import { BRANCH_OPTIONS, COURSE_OPTIONS, YEAR_OPTIONS } from '../constants';
import { registerUser, loginUser } from '../services/storage';

interface AuthFormsProps {
  onLoginSuccess: (user: User) => void;
}

const AuthForms: React.FC<AuthFormsProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Student Specific
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [otherBranch, setOtherBranch] = useState('');
  const [course, setCourse] = useState(COURSE_OPTIONS[0]);
  const [otherCourse, setOtherCourse] = useState('');
  const [year, setYear] = useState(YEAR_OPTIONS[0]);
  const [parentEmail, setParentEmail] = useState('');
  
  // Parent Specific
  const [studentEmail, setStudentEmail] = useState('');
  
  // Mentor Specific
  const [facultyId, setFacultyId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setError('');
    setSuccess('');
    // Reset specific fields if needed
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setParentEmail('');
    setStudentEmail('');
    setFacultyId('');
    setOtherBranch('');
    setOtherCourse('');
    setBranch(BRANCH_OPTIONS[0]);
    setCourse(COURSE_OPTIONS[0]);
    setYear(YEAR_OPTIONS[0]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = loginUser(email, password, selectedRole);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalBranch = branch === 'Other' ? otherBranch : branch;
    const finalCourse = course === 'Other' ? otherCourse : course;

    // Validation basics
    if (!name || !email || !password) {
      setError('Please fill all required fields.');
      return;
    }

    if (selectedRole === Role.STUDENT && (!finalBranch || !finalCourse || !parentEmail)) {
      setError('Please fill all student details including Parent Email.');
      return;
    }

    if (selectedRole === Role.PARENT && !studentEmail) {
      setError('Please provide Student Email ID.');
      return;
    }

    if (selectedRole === Role.MENTOR && !facultyId) {
      setError('Please provide Faculty ID.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: selectedRole,
      ...(selectedRole === Role.STUDENT && {
        branch: finalBranch,
        course: finalCourse,
        year,
        parentEmail
      }),
      ...(selectedRole === Role.PARENT && { studentEmail }),
      ...(selectedRole === Role.MENTOR && { facultyId })
    };

    const res = registerUser(newUser);
    if (res.success) {
      setSuccess('Registration successful! You can now login.');
      resetForm();
      setActiveTab('login');
    } else {
      setError(res.message);
    }
  };

  // Common input class for consistency
  const inputClass = "w-full p-2 border border-gray-300 rounded focus:border-nmims-red focus:outline-none bg-white text-black";

  return (
    <div className="max-w-md mx-auto mt-10">
      {/* Container styling matches for consistency */}
      <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-nmims-red">
        
        {/* Role Toggles */}
        <div className="flex mb-6 bg-gray-100 p-1 rounded">
          {Object.values(Role).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`flex-1 py-2 text-sm font-medium rounded transition-all ${
                selectedRole === role
                  ? 'bg-white text-nmims-red shadow-sm'
                  : 'text-gray-500 hover:text-nmims-black'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-nmims-black">
          {activeTab === 'login' ? `Login as ${selectedRole}` : `Register as ${selectedRole}`}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded text-sm text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 border border-green-200 rounded text-sm text-center">
            {success}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-nmims-red text-white py-2 rounded font-bold hover:bg-nmims-darkRed transition"
            >
              Login
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className="text-nmims-red text-sm hover:underline"
              >
                Don’t have an account? Register here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                className={`${inputClass} capitalize`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {selectedRole === Role.STUDENT && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className={inputClass}
                    >
                      {BRANCH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Course</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className={inputClass}
                    >
                      {COURSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                {branch === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Specify Branch</label>
                    <input
                      type="text"
                      className={`${inputClass} capitalize`}
                      value={otherBranch}
                      onChange={(e) => setOtherBranch(e.target.value)}
                    />
                  </div>
                )}
                {course === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Specify Course</label>
                    <input
                      type="text"
                      className={`${inputClass} capitalize`}
                      value={otherCourse}
                      onChange={(e) => setOtherCourse(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={inputClass}
                  >
                    {YEAR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Parent Email (Compulsory)</label>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>
              </>
            )}

            {selectedRole === Role.PARENT && (
              <div>
                <label className="block text-sm font-semibold mb-1">Student Email ID</label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>
            )}

            {selectedRole === Role.MENTOR && (
              <div>
                <label className="block text-sm font-semibold mb-1">Faculty ID</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-nmims-red text-white py-2 rounded font-bold hover:bg-nmims-darkRed transition"
            >
              Register
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className="text-nmims-red text-sm hover:underline"
              >
                Already have an account? Login here
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthForms;