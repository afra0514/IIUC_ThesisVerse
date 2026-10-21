
import React, { useState, useMemo, useEffect } from 'react';
import { Lock } from 'lucide-react';
import SupervisorFilters from './SupervisorFilters';
import SupervisorCard from './SupervisorCard';
import SupervisorDetailModal from './SupervisorDetailModal';
import SupervisionRequestModal from '../requests/SupervisionRequestModal';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import '../../styles/supervisorDirectory/SupervisorSection.css';

export default function SupervisorSection({ onOpenAuthModal, isLoggedIn, savedKeys = [], onToggleSave, externalSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedDomain, setSelectedDomain] = useState('All domains');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);
  const [requestingSupervisorId, setRequestingSupervisorId] = useState(null);

  const { user } = useAuth();
  const { supervisors, myRequests } = useAppData();
  const isStudent = user?.role === 'student';

  const selectedSupervisor = supervisors.find((s) => s.id === selectedSupervisorId) || null;
  const requestingSupervisor = supervisors.find((s) => s.id === requestingSupervisorId) || null;

  const guestLockProps = isLoggedIn
    ? {}
    : {
        onMouseDownCapture: (e) => e.preventDefault(),
        onClickCapture: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof onOpenAuthModal === 'function') onOpenAuthModal();
        },
        onKeyDownCapture: (e) => {
          if (e.key === 'Tab' || e.key === 'Shift') return;
          e.preventDefault();
          e.stopPropagation();
          if (typeof onOpenAuthModal === 'function') onOpenAuthModal();
        }
      };

  useEffect(() => {
    if (externalSearch && externalSearch.nonce) {
      setSearchQuery(externalSearch.text || '');
      setSelectedDept('All Departments');
      setSelectedDomain('All domains');
    }
  }, [externalSearch]);

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter((sup) => {
      const matchSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDept =
        selectedDept === 'All Departments' || sup.department.includes(selectedDept);
      const matchDomain =
        selectedDomain === 'All domains' || sup.tags.includes(selectedDomain);

      return matchSearch && matchDept && matchDomain;
    });
  }, [searchQuery, selectedDept, selectedDomain, supervisors]);

  const handleCardAction = (supervisor) => {
    if (!isLoggedIn) {
      if (typeof onOpenAuthModal === 'function') {
        onOpenAuthModal();
      }
      return;
    }
    
    setSelectedSupervisorId(supervisor.id);
  };

  return (
    <section className="supervisor-section" id="supervisors">
      <div className="supervisor-container">
        
        <div className="supervisor-header-wrapper">
          <div>
            <span className="supervisor-feature-tag">FEATURE 01</span>
            <h2 className="supervisor-main-title">Supervisor Directory</h2>
            <p className="supervisor-subtitle">
              Browse verified CSE and EEE faculty by research domain, publication record and open supervision slots.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="preview-lock-badge">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Only - Login to Access</span>
            </div>
          )}
        </div>

        <div style={{ display: 'contents' }} {...guestLockProps}>
          <SupervisorFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDept={selectedDept}
            onDeptChange={setSelectedDept}
            selectedDomain={selectedDomain}
            onDomainChange={setSelectedDomain}
          />
        </div>

        <div className="supervisor-grid">
          {filteredSupervisors.map((supervisor) => (
            <SupervisorCard
              key={supervisor.id}
              supervisor={supervisor}
              onClick={() => handleCardAction(supervisor)}
              isLoggedIn={isLoggedIn}
              isSaved={savedKeys.includes(`sup-${supervisor.id}`)}
              onToggleSave={() =>
                onToggleSave && onToggleSave({
                  key: `sup-${supervisor.id}`,
                  kind: 'supervisor',
                  title: supervisor.name,
                  subtitle: `${supervisor.designation}, ${supervisor.department}`
                })
              }
            />
          ))}
        </div>

      </div>

      {selectedSupervisor && isLoggedIn && (
        <SupervisorDetailModal
          supervisor={selectedSupervisor}
          onClose={() => setSelectedSupervisorId(null)}
          canRequest={isStudent}
          existingRequest={myRequests.find((r) => String(r.supervisorId) === String(selectedSupervisor.id))}
          onRequest={() => {
            setRequestingSupervisorId(selectedSupervisor.id);
            setSelectedSupervisorId(null);
          }}
        />
      )}

      {requestingSupervisor && isLoggedIn && isStudent && (
        <SupervisionRequestModal
          supervisor={requestingSupervisor}
          onClose={() => setRequestingSupervisorId(null)}
        />
      )}
    </section>
  );

}