import React, { useState, useEffect } from 'react';
import { User, Role, LeaveRequest, LeaveStatus } from '../types';
import { 
  getStudentLeaves, 
  getParentLeaves, 
  getMentorLeaves, 
  createLeaveRequest, 
  updateLeaveRequest 
} from '../services/storage';
import { LEAVE_TYPE_OPTIONS } from '../constants';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Student
  const [mentorEmail, setMentorEmail] = useState('');
  const [leaveType, setLeaveType] = useState(LEAVE_TYPE_OPTIONS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Comment State for Parent/Mentor actions
  const [actionId, setActionId] = useState<string | null>(null); // Which leave is being acted on
  const [comment, setComment] = useState('');

  const refreshData = () => {
    setLoading(true);
    let data: LeaveRequest[] = [];
    if (user.role === Role.STUDENT) {
      data = getStudentLeaves(user.email);
    } else if (user.role === Role.PARENT) {
      data = getParentLeaves(user.email);
    } else if (user.role === Role.MENTOR) {
      data = getMentorLeaves(user.email);
    }
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!user.parentEmail) {
      setFormError('Parent email not found in profile.');
      return;
    }

    if (!startDate || !endDate || !reason || !mentorEmail) {
      setFormError('Please fill all fields.');
      return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      studentName: user.name,
      studentEmail: user.email,
      parentEmail: user.parentEmail,
      mentorEmail: mentorEmail,
      leaveType,
      startDate,
      endDate,
      reason,
      parentStatus: LeaveStatus.PENDING,
      mentorStatus: LeaveStatus.PENDING,
      createdAt: new Date().toISOString()
    };

    createLeaveRequest(newLeave);
    setFormSuccess('Leave application submitted successfully!');
    setMentorEmail('');
    setReason('');
    setStartDate('');
    setEndDate('');
    refreshData();
  };

  const handleAction = (leave: LeaveRequest, approved: boolean) => {
    const updatedLeave = { ...leave };
    const status = approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;

    if (user.role === Role.PARENT) {
      updatedLeave.parentStatus = status;
      updatedLeave.parentComment = comment;
    } else if (user.role === Role.MENTOR) {
      updatedLeave.mentorStatus = status;
      updatedLeave.mentorComment = comment;
    }

    updateLeaveRequest(updatedLeave);
    setActionId(null);
    setComment('');
    refreshData();
  };

  const getStatusBadge = (leave: LeaveRequest) => {
    if (leave.parentStatus === LeaveStatus.REJECTED || leave.mentorStatus === LeaveStatus.REJECTED) {
      return <span className="text-nmims-red font-bold flex items-center gap-1"><XCircle size={16} /> Not Approved</span>;
    }

    if (leave.parentStatus === LeaveStatus.APPROVED && leave.mentorStatus === LeaveStatus.APPROVED) {
      return <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={16} /> Approved</span>;
    }

    if (leave.parentStatus === LeaveStatus.APPROVED && leave.mentorStatus === LeaveStatus.PENDING) {
      return <span className="text-orange-600 font-bold flex items-center gap-1"><Clock size={16} /> Parent Approved</span>;
    }

    return <span className="text-gray-600 font-bold flex items-center gap-1"><Clock size={16} /> Pending Parent Approval</span>;
  };

  // Common input styles
  const inputClass = "w-full p-2 border border-gray-300 rounded focus:border-nmims-red focus:outline-none bg-white text-black";

  // Render Helpers
  const renderLeaveCard = (leave: LeaveRequest) => {
    const isParent = user.role === Role.PARENT;
    const isMentor = user.role === Role.MENTOR;
    const isStudent = user.role === Role.STUDENT;

    // Determine if current user can act
    let canAct = false;
    if (isParent && leave.parentStatus === LeaveStatus.PENDING) canAct = true;
    if (isMentor && leave.mentorStatus === LeaveStatus.PENDING) canAct = true;

    return (
      <div key={leave.id} className="bg-white border-l-4 border-nmims-red shadow-md rounded p-4 mb-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-lg capitalize">{leave.leaveType} Leave</h3>
            <p className="text-sm text-gray-500 capitalize">Student: {leave.studentName}</p>
            <p className="text-sm text-gray-500">From: {leave.startDate} To: {leave.endDate}</p>
          </div>
          <div className="text-right">
            <div className="mb-1">{getStatusBadge(leave)}</div>
            <p className="text-xs text-gray-400">Applied: {new Date(leave.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Changed from grey background to white with border for clarity */}
        <div className="mt-3 p-3 bg-white rounded border border-gray-300">
          <p className="font-medium text-sm text-nmims-black"><span className="text-nmims-red font-bold">Reason:</span> {leave.reason}</p>
        </div>

        {/* Status Comments Section - changed to white backgrounds with colored borders */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className={`p-3 rounded border-2 ${
            leave.parentStatus === LeaveStatus.APPROVED ? 'border-green-500 bg-white' : 
            leave.parentStatus === LeaveStatus.REJECTED ? 'border-red-500 bg-white' : 
            'border-gray-300 bg-white'
          }`}>
            <p className="font-bold capitalize text-black">
              Parent Status: <span className={
                leave.parentStatus === LeaveStatus.APPROVED ? 'text-green-600' : 
                leave.parentStatus === LeaveStatus.REJECTED ? 'text-nmims-red' : 
                'text-gray-500'
              }>{leave.parentStatus}</span>
            </p>
            {leave.parentComment && <p className="mt-1 italic text-gray-700">"{leave.parentComment}"</p>}
          </div>
          
          {(leave.parentStatus === LeaveStatus.APPROVED || isStudent) && (
             <div className={`p-3 rounded border-2 ${
               leave.mentorStatus === LeaveStatus.APPROVED ? 'border-green-500 bg-white' : 
               leave.mentorStatus === LeaveStatus.REJECTED ? 'border-red-500 bg-white' : 
               'border-gray-300 bg-white'
             }`}>
             <p className="font-bold capitalize text-black">
               Mentor Status: <span className={
                 leave.mentorStatus === LeaveStatus.APPROVED ? 'text-green-600' : 
                 leave.mentorStatus === LeaveStatus.REJECTED ? 'text-nmims-red' : 
                 'text-gray-500'
               }>{leave.mentorStatus}</span>
             </p>
             {leave.mentorComment && <p className="mt-1 italic text-gray-700">"{leave.mentorComment}"</p>}
           </div>
          )}
        </div>

        {/* Action Buttons for Parent/Mentor */}
        {canAct && actionId !== leave.id && (
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => setActionId(leave.id)}
              className="px-4 py-2 bg-nmims-red text-white rounded hover:bg-nmims-darkRed transition"
            >
              Review Application
            </button>
          </div>
        )}

        {/* Action Form */}
        {canAct && actionId === leave.id && (
          <div className="mt-4 p-4 border-2 border-nmims-red rounded bg-white animate-in fade-in slide-in-from-top-2">
            <label className="block mb-2 font-medium text-black">Add Comment (Required for Rejection):</label>
            <textarea
              className={`${inputClass} mb-3`}
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your remarks here..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(leave, true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(leave, false)}
                className="px-4 py-2 bg-nmims-red text-white rounded hover:bg-nmims-darkRed font-bold"
              >
                Reject
              </button>
              <button
                onClick={() => { setActionId(null); setComment(''); }}
                className="px-4 py-2 bg-gray-200 text-black border border-gray-300 rounded hover:bg-gray-300 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Application Form (Student Only) */}
      {user.role === Role.STUDENT && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-nmims-red sticky top-8">
            <h2 className="text-xl font-bold mb-4 text-nmims-red border-b pb-2">Apply For Leave</h2>
            {formSuccess && <div className="mb-4 p-3 bg-white text-green-700 rounded border-2 border-green-500">{formSuccess}</div>}
            {formError && <div className="mb-4 p-3 bg-white text-nmims-red rounded border-2 border-nmims-red">{formError}</div>}
            
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Mentor Email</label>
                <input
                  type="email"
                  required
                  value={mentorEmail}
                  onChange={(e) => setMentorEmail(e.target.value)}
                  className={`${inputClass} focus:ring-1 focus:ring-nmims-red`}
                  placeholder="faculty@nmims.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className={inputClass}
                >
                  {LEAVE_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`${inputClass} capitalize`}
                  placeholder="Reason for leave..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-nmims-red text-white py-2 rounded font-bold hover:bg-nmims-darkRed transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Right Column (or Full Width): Leave List */}
      <div className={user.role === Role.STUDENT ? "lg:col-span-2" : "lg:col-span-3"}>
        <h2 className="text-2xl font-bold mb-6 text-nmims-black border-b-2 border-nmims-red inline-block pb-1">
          {user.role === Role.STUDENT ? "My Applications" : "Leave Requests"}
        </h2>
        
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 bg-white rounded border border-dashed border-gray-300">
            <p className="text-gray-500">No leave records found.</p>
          </div>
        ) : (
          <div>
            {leaves.map(renderLeaveCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;