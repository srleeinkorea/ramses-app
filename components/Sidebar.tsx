
import React, { useState, useMemo } from 'react';
import { Department, Patient } from '../types';

interface SidebarProps {
  department: Department;
  onDepartmentChange: (dept: Department) => void;
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patient: Patient) => void;
}

const SearchIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.16-1.1c-1.07-1.1-3.21-3.6-3.21-5.69 0-2.3 1.5-4.11 3.79-4.11 1.13 0 2.22.59 2.95 1.62.73-1.03 1.82-1.62 2.95-1.62 2.29 0 3.79 1.81 3.79 4.11 0 2.09-2.14 4.59-3.21 5.69a20.803 20.803 0 01-1.18 1.12l-.02.02-.005.003a.5.5 0 01-.52 0z" />
    </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  department, 
  onDepartmentChange, 
  patients, 
  selectedPatientId, 
  onSelectPatient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'severity' | 'age'>('severity');

  const getHeaderTitle = () => {
      switch(department) {
          case 'PEDIATRICS': return 'PEDI-AIR';
          case 'SURGERY': return 'G-PEP';
          case 'COLORECTAL': return 'C-PEP';
          default: return 'RAMSES';
      }
  };

  const filteredPatients = useMemo(() => {
    let result = patients.filter(p => 
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
             return scoreB - scoreA; 
        }
        