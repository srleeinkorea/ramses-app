
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import AgentConfigPanel from './components/AgentConfigPanel';
import CreateAgentModal from './components/CreateAgentModal';
import PatientContext from './components/PatientContext';
import KnowledgeBasePanel from './components/KnowledgeBasePanel';
import AlertCenter from './components/AlertCenter';
import { INITIAL_AGENTS_PEDIATRICS, INITIAL_AGENTS_PEP, INITIAL_AGENTS_COLORECTAL, AGENT_TYPE_DETAILS, INITIAL_KNOWLEDGE_SOURCES, MOCK_PATIENTS } from './constants';
import { Agent, AgentConfig, AgentTemplate, AgentType, KnowledgeSource, Department, Patient, Alert, AlertSeverity, MonitoringConfig, VentilatorConfig } from './types';

const TEMPLATES_STORAGE_KEY = 'ai_agent_templates';

const App: React.FC = () => {
  const [department, setDepartment] = useState<Department>('PEDIATRICS');
  // Initialize agents based on the default department
  const [agents, setAgents] = useState<Agent<any>[]>(INITIAL_AGENTS_PEDIATRICS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(INITIAL_AGENTS_PEDIATRICS.length > 0 ? INITIAL_AGENTS_PEDIATRICS[0].id : 'knowledge-base');
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(INITIAL_KNOWLEDGE_SOURCES);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Patient Management
  const availablePatients = useMemo(() => MOCK_PATIENTS.filter(p => p.department === department), [department]);
  const [currentPatient, setCurrentPatient] = useState<Patient>(availablePatients[0]);

  // Handle Department Switch
  const handleDepartmentChange = useCallback((newDept: Department) => {
    setDepartment(newDept);
    
    // Switch default agent set based on department
    let newAgents: Agent<any>[] = [];
    if (newDept === 'SURGERY') {
        newAgents = INITIAL_AGENTS_PEP;
    } else if (newDept === 'COLORECTAL') {
        newAgents = INITIAL_AGENTS_COLORECTAL;
    } else {
        newAgents = INITIAL_AGENTS_PEDIATRICS;
    }
    
    setAgents(newAgents);
    setSelectedItemId(newAgents.length > 0 ? newAgents[0].id : null);

    // Switch to first patient of new department
    const newPatients = MOCK_PATIENTS.filter(p => p.department === newDept);
    if (newPatients.length > 0) {
        setCurrentPatient(newPatients[0]);
    }
  }, []);

  useEffect(() => {
    try {
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load templates from localStorage", error);
    }
  }, []);

  // Alert Simulation Logic
  useEffect(() => {
    // Only simulate if we have a current patient
    if (!currentPatient) return;

    const intervalId = setInterval(() => {
        // 30% chance to trigger an event per interval
        if (Math.random() > 0.3) return;

        const newAlerts: Alert[] = [];
        const timestamp = Date.now();

        // 1. Vital Signs Monitoring Simulation
        const vitalAgent = agents.find(a => a.type === AgentType.MONITORING_VITAL_SIGNS && a.enabled);
        if (vitalAgent) {
            const config = vitalAgent.config as MonitoringConfig;
            // Simulate SpO2 Drop
            if (config.parameters.spo2) {
                // Random value between 85 and 99
                const simulatedSpO2 = Math.floor(Math.random() * (99 - 85 + 1)) + 85;
                if (simulatedSpO2 < config.spo2Threshold) {
                    newAlerts.push({
                        id: `alert-${timestamp}-spo2`,
                        timestamp,
                        severity: simulatedSpO2 < 88 ? 'critical' : 'warning',
                        message: `SpO2 저하 감지: ${simulatedSpO2}% (임계값: ${config.spo2Threshold}%)`,
                        agentName: vitalAgent.name,
                        patientId: currentPatient.id,
                        patientName: currentPatient.name,
                        isRead: false,
                    });
                }
            }
        }

        // 2. Ventilator Monitoring Simulation (Pediatrics specific)
        const ventAgent = agents.find(a => a.type === AgentType.MONITORING_VENTILATOR && a.enabled);
        if (ventAgent && department === 'PEDIATRICS') {
             const config = ventAgent.config as VentilatorConfig;
             // Simulate High Pressure
             if (config.parameters.peakInspiratoryPressure && Math.random() < 0.2) {
                 const simulatedPIP = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
                 if (simulatedPIP > config.pipThreshold) {
                      newAlerts.push({
                        id: `alert-${timestamp}-pip`,
                        timestamp,
                        severity: 'critical',
                        message: `기도압(PIP) 상승 경고: ${simulatedPIP} cmH2O`,
                        agentName: ventAgent.name,
                        patientId: currentPatient.id,
                        patientName: currentPatient.name,
                        isRead: false,
                    });
                 }
             }
        }

        // 3. Surgery Specific Alerts
        if (department === 'SURGERY' && Math.random() < 0.15) {
             const erasAgent = agents.find(a => a.type === AgentType.CONVERSATIONAL_CHATBOT && a.enabled);
             if (erasAgent) {
                  newAlerts.push({
                        id: `alert-${timestamp}-pain`,
                        timestamp,
                        severity: 'warning',
                        message: `환자 통증 호소 빈도 증가 (최근 1시간 내 3회)`,
                        agentName: '수술 후 회복 가이드',
                        patientId: currentPatient.id,
                        patientName: currentPatient.name,
                        isRead: false,
                    });
             }
        }

        // 4. Colorectal Specific Alerts
        if (department === 'COLORECTAL' && Math.random() < 0.1) {
            newAlerts.push({
                id: `alert-${timestamp}-risk`,
                timestamp,
                severity: 'warning',
                message: `재발 위험 예측 스코어 변동 감지 (상승 추세)`,
                agentName: 'AI 재발 예측 분석',
                patientId: currentPatient.id,
                patientName: currentPatient.name,
                isRead: false,
            });
        }

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev]);
        }

    }, 8000); // Check every 8 seconds

    return () => clearInterval(intervalId);
  }, [currentPatient, agents, department]);

  const handleMarkAsRead = useCallback((alertId: string) => {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  }, []);

  const handleClearAlerts = useCallback(() => {
      setAlerts([]);
  }, []);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItemId(id);
  }, []);
  
  const handleConfigChange = useCallback((agentId: string, newConfig: AgentConfig, newEnabledState?: boolean) => {
    setAgents(prevAgents =>
      prevAgents.map(agent => {
        if (agent.id === agentId) {
          const updatedAgent = { ...agent, config: newConfig };
          if (typeof newEnabledState === 'boolean') {
            updatedAgent.enabled = newEnabledState;
          }
          return updatedAgent;
        }
        return agent;
      })
    );
  }, [setAgents]);

  const handleSaveTemplate = useCallback((name: string, agentType: AgentType, config: AgentConfig) => {
    const newTemplate: AgentTemplate = {
      id: `template-${Date.now()}`,
      name,
      agentType,
      config,
    };
    setTemplates(prevTemplates => {
      const updatedTemplates = [...prevTemplates, newTemplate];
      try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
      } catch (error) {
        console.error("Failed to save templates to localStorage", error);
      }
      return updatedTemplates;
    });
  }, [setTemplates]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    setTemplates(prevTemplates => {
      const updatedTemplates = prevTemplates.filter(t => t.id !== templateId);
       try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
      } catch (error) {
        console.error("Failed to save templates to localStorage", error);
      }
      return updatedTemplates;
    });
  }, [setTemplates]);

  const handleCreateAgent = useCallback((name: string, description: string, type: AgentType) => {
    const details = AGENT_TYPE_DETAILS[type];
    if (!details) return;

    const newAgent: Agent<any> = {
      id: `agent-${Date.now()}`,
      name,
      description,
      type,
      category: details.category,
      icon: details.icon,
      config: details.defaultConfig,
      enabled: true,
    };

    setAgents(prev => [...prev, newAgent]);
    setSelectedItemId(newAgent.id);
    setIsCreateModalOpen(false);
  }, [setAgents, setIsCreateModalOpen]);

  const handleUpdateKnowledgeSources = useCallback((newSources: KnowledgeSource[]) => {
    setKnowledgeSources(newSources);
  }, [setKnowledgeSources]);


  const selectedAgent = agents.find(agent => agent.id === selectedItemId);

  const getHeaderTitle = () => {
    switch(department) {
        case 'PEDIATRICS': return 'V.Doc PEDI-AIR';
        case 'SURGERY': return 'V.Doc G-PEP';
        case 'COLORECTAL': return 'V.Doc C-PEP';
        default: return 'V.Doc';
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 font-sans">
        <Sidebar
          agents={agents}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
          onOpenCreateAgentModal={() => setIsCreateModalOpen(true)}
          department={department}
          onDepartmentChange={handleDepartmentChange}
        />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="bg-white shadow-sm p-4 border-b border-gray-200 flex flex-col space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                    {getHeaderTitle()}
                    </h1>
                    <p className="text-sm text-gray-500">Medical AI Agent Control Center (Powered by RAMSES)</p>
                </div>
                <div className="flex items-center space-x-4">
                    <AlertCenter 
                        alerts={alerts} 
                        onMarkAsRead={handleMarkAsRead} 
                        onClearAll={handleClearAlerts}
                    />
                </div>
            </div>
            <PatientContext 
                department={department} 
                patient={currentPatient}
                allPatients={availablePatients}
                onPatientChange={setCurrentPatient}
            />
          </header>
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {selectedItemId === 'knowledge-base' ? (
                <KnowledgeBasePanel 
                    knowledgeSources={knowledgeSources}
                    onUpdateKnowledgeSources={handleUpdateKnowledgeSources}
                />
            ) : selectedAgent ? (
                <AgentConfigPanel
                  key={selectedAgent.id}
                  agent={selectedAgent}
                  onConfigChange={handleConfigChange}
                  templates={templates}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  allKnowledgeSources={knowledgeSources}
                />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-4">설정을 시작하려면 에이전트를 선택하거나 Knowledge DB를 관리하세요.</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    + 새 에이전트 생성
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAgent={handleCreateAgent}
      />
    </>
  );
};

export default App;
