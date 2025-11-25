


import React, { useState, useEffect, useMemo } from 'react';
import { Department, Patient } from '../types';
import Modal from './common/Modal';

interface PatientContextProps {
    department: Department;
    patient: Patient;
    allPatients: Patient[];
    onPatientChange: (patient: Patient) => void;
}

// Icons
const MaleIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const FemaleIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0A18.75 18.75 0 0 1 12 22.5c-2.793 0-5.49-.606-7.5-1.75Z" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.16-1.1c-1.07-1.1-3.21-3.6-3.21-5.69 0-2.3 1.5-4.11 3.79-4.11 1.13 0 2.22.59 2.95 1.62.73-1.03 1.82-1.62 2.95-1.62 2.29 0 3.79 1.81 3.79 4.11 0 2.09-2.14 4.59-3.21 5.69a20.803 20.803 0 01-1.18 1.12l-.02.02-.005.003a.5.5 0 01-.52 0z" />
    </svg>
);

const UserGroupIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 5.472m0 0a9.09 9.09 0 0 0-3.267-1.512 3 3 0 0 0-2.84 2.627m3.267 3.45a.75.75 0 1 0-.996 1.052A12.01 12.01 0 0 0 12 21c2.31 0 4.498-.568 6.43-1.579a.75.75 0 1 0-.996-1.052 10.966 10.966 0 0 1-5.434 1.455ZM12 12.75a6.001 6.001 0 0 0-6-6 6.001 6.001 0 0 0 6 6Zm0-6a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);


const PatientContext: React.FC<PatientContextProps> = ({ department, patient, allPatients, onPatientChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPatientListOpen, setIsPatientListOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', status: '' });
  
  // Filtering and Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'severity' | 'age'>('severity');

  useEffect(() => {
    if (patient) {
        setEditData({ name: patient.name, status: patient.status });
        setIsEditing(false);
    }
  }, [patient]);


  const handleEdit = () => {
    setEditData({ name: patient.name, status: patient.status });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchPatient = (selectedPatient: Patient) => {
      onPatientChange(selectedPatient);
      setIsPatientListOpen(false);
  };

  // Filter and Sort Logic
  const filteredPatients = useMemo(() => {
    let result = allPatients.filter(p => 
        p.name.includes(searchTerm) || 
        p.diagnosis.includes(searchTerm) ||
        p.id.includes(searchTerm)
    );

    return result.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'age') return a.age - b.age;
        if (sortBy === 'severity') {
             const scoreA = (a.complicationRisk?.score || a.recurrenceRisk?.score || 0);
             const scoreB = (b.complicationRisk?.score || b.recurrenceRisk?.score || 0);
             // Sort by descending severity
             return scoreB - scoreA; 
        }
        return 0;
    });
  }, [allPatients, searchTerm, sortBy]);


  if (!patient) return <div>환자 정보를 불러오는 중...</div>;

  const isMale = patient.gender === '남';
  const isSurgery = department === 'SURGERY';
  const isColorectal = department === 'COLORECTAL';

  // Theme based on Gender and Department
  const genderTheme = {
    container: isMale ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200',
    iconContainer: isMale ? 'bg-blue-200' : 'bg-pink-200',
    icon: isMale ? 'text-blue-700' : 'text-pink-700',
  };
  
  let containerClass = genderTheme.container;
  if (isSurgery) containerClass = 'bg-slate-50 border-slate-300';
  if (isColorectal) containerClass = 'bg-purple-50 border-purple-200';

  const renderComplicationScore = (p: Patient, small = false) => {
    if ((p.department !== 'SURGERY' && p.department !== 'COLORECTAL')) return null;
    
    // Determine which risk data to use
    const riskData = p.department === 'COLORECTAL' ? p.recurrenceRisk : p.complicationRisk;
    if (!riskData) return null;

    const { score, level, label } = riskData;
    const title = p.department === 'COLORECTAL' ? '재발 위험도' : '합병증 예측';
    const icon = p.department === 'COLORECTAL' ? <TrendingUpIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />;

    // Determine color based on risk level
    let colorClass = 'bg-green-100 text-green-800 border-green-200';
    let barColor = 'bg-green-500';
    
    // Use different base hue for Colorectal
    if (p.department === 'COLORECTAL') {
         if (level === 'Moderate') {
            colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
            barColor = 'bg-purple-500';
         } else if (level === 'High' || level === 'Critical') {
            colorClass = 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
            barColor = 'bg-fuchsia-600';
         } else {
             colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
             barColor = 'bg-indigo-500';
         }
    } else {
         if (level === 'Moderate') {
            colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            barColor = 'bg-yellow-500';
        } else if (level === 'High' || level === 'Critical') {
            colorClass = 'bg-red-100 text-red-800 border-red-200';
            barColor = 'bg-red-500';
        }
    }


    if (small) {
         return (
             <div className={`mt-1 sm:mt-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold ${colorClass}`}>
                 <span className="mr-1">{icon}</span>
                <span>{score} ({level})</span>
             </div>
         );
    }

    return (
        <div className={`ml-0 sm:ml-6 mt-3 sm:mt-0 p-3 rounded-lg border flex flex-col items-center justify-center min-w-[140px] ${colorClass}`}>
            <div className="flex items-center space-x-1 mb-1">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
            </div>
            <div className="text-2xl font-extrabold">{score}<span className="text-sm font-normal opacity-75">/100</span></div>
            <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }}></div>
            </div>
            <div className="text-xs font-semibold mt-1">{label} ({level})</div>
        </div>
    );
  };

  return (
    <>
    <div className={`border rounded-lg p-4 transition-all duration-300 ${containerClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start flex-grow">
          <div className={`${genderTheme.iconContainer} p-2 rounded-full flex-shrink-0 mt-1 shadow-sm`}>
             {isMale ? 
                <MaleIcon className={`h-8 w-8 ${genderTheme.icon}`} /> :
                <FemaleIcon className={`h-8 w-8 ${genderTheme.icon}`} />
             }
          </div>
          <div className="ml-4 flex-grow">
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                 <div className="flex items-center space-x-2">
                    <label htmlFor="patient-name" className="text-sm font-semibold text-gray-700 w-16">이름:</label>
                    <input 
                        id="patient-name"
                        name="name"
                        type="text"
                        value={editData.name}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                    />
                 </div>
                 <div className="flex items-start space-x-2">
                    <label htmlFor="patient-status" className="text-sm font-semibold text-gray-700 w-16 pt-1.5">상태:</label>
                    <textarea 
                        id="patient-status"
                        name="status"
                        rows={2}
                        value={editData.status}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1.5"
                    />
                </div>
              </div>
            ) : (
                <>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                    <span className="text-sm text-gray-500">({patient.gender}/{patient.age}세)</span>
                     {isSurgery && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded">V.Doc G-PEP</span>}
                     {isColorectal && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded">V.Doc C-PEP</span>}
                    <button 
                        onClick={() => { setIsPatientListOpen(true); setSearchTerm(''); }}
                        className="ml-2 flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                    >
                         <UserGroupIcon className="h-4 w-4" />
                        <span>환자 변경</span>
                        <ChevronDownIcon className="h-3 w-3 text-gray-400" />
                    </button>
                </div>
                <div className="text-base text-gray-700 font-medium">
                    <span className="text-gray-500 mr-2">진단명:</span>
                    {patient.diagnosis}
                </div>
                <div className="mt-2 text-sm text-gray-800 bg-white bg-opacity-60 p-2.5 rounded-md border border-gray-200/60 shadow-sm inline-block max-w-xl">
                    <span className="font-bold mr-1 text-gray-900">현재 상태:</span>
                    {patient.status}
                </div>
                </>
            )}
            
          </div>
        </div>
        
        {/* Complication or Recurrence Score */}
        {renderComplicationScore(patient)}

        <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 self-start">
            {isEditing ? (
                <div className="flex space-x-2">
                     <button 
                        onClick={handleCancel}
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors text-sm"
                    >
                        취소
                    </button>
                    <button 
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors text-sm"
                    >
                        저장
                    </button>
                </div>
            ) : (
                 <button 
                    onClick={handleEdit}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
                    title="환자 정보 수정"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
        </div>
      </div>
    </div>

    {/* Patient Selection Modal */}
    <Modal isOpen={isPatientListOpen} onClose={() => setIsPatientListOpen(false)} title="환자 선택">
        <div className="flex flex-col h-[65vh]">
            {/* Search and Filter Header */}
            <div className="flex-shrink-0 mb-4 space-y-3 pb-3 border-b border-gray-200">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="이름, 진단명, ID 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                         <span className="text-xs text-gray-400">
                             {filteredPatients.length} / {allPatients.length}명
                         </span>
                    </div>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                     <button 
                        onClick={() => setSortBy('severity')} 
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${sortBy === 'severity' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                     >
                        위험도순
                     </button>
                     <button 
                        onClick={() => setSortBy('name')} 
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${sortBy === 'name' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                     >
                        이름순
                     </button>
                     <button 
                        onClick={() => setSortBy('age')} 
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${sortBy === 'age' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                     >
                        나이순
                     </button>
                </div>
            </div>

            {/* Patient List */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {filteredPatients.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {filteredPatients.map((p) => (
                            <li key={p.id}>
                                <button
                                    onClick={() => handleSwitchPatient(p)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group ${patient.id === p.id ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-bold text-gray-900">{p.name}</span>
                                            <span className="text-xs text-gray-500">({p.gender}/{p.age}세)</span>
                                            {renderComplicationScore(p, true)}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-0.5 truncate">{p.diagnosis}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{p.status}</p>
                                    </div>
                                    <div className="text-gray-400 group-hover:text-blue-500">
                                         {patient.id === p.id ? (
                                             <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                 </svg>
                                             </div>
                                         ) : (
                                            <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                                         )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                         <SearchIcon className="h-10 w-10 text-gray-300 mb-2" />
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    </Modal>
    </>
  );
};

export default PatientContext;