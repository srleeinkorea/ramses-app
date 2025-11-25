import React, { useState } from 'react';
import { Agent, AgentType, AgentConfig, AgentTemplate, KnowledgeSource } from '../types';
import MonitoringAgentConfigPanel from './config_panels/MonitoringAgentConfig';
import ChatbotAgentConfigPanel from './config_panels/ChatbotAgentConfig';
import ReportingAgentConfigPanel from './config_panels/ReportingAgentConfig';
import VentilatorAgentConfigPanel from './config_panels/VentilatorAgentConfig';
import Card from './common/Card';
import ToggleSwitch from './common/ToggleSwitch';
import Modal from './common/Modal';

interface AgentConfigPanelProps {
  agent: Agent<any>;
  onConfigChange: (agentId: string, newConfig: AgentConfig, newEnabledState?: boolean) => void;
  templates: AgentTemplate[];
  onSaveTemplate: (name: string, agentType: AgentType, config: AgentConfig) => void;
  onDeleteTemplate: (templateId: string) => void;
  allKnowledgeSources: KnowledgeSource[];
}

const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({ agent, onConfigChange, templates, onSaveTemplate, onDeleteTemplate, allKnowledgeSources }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleEnabledChange = (enabled: boolean) => {
    onConfigChange(agent.id, agent.config, enabled);
  };

  const handleSaveTemplate = () => {
    if (templateName.trim()) {
      onSaveTemplate(templateName.trim(), agent.type, agent.config);
      setTemplateName('');
      setIsSaveModalOpen(false);
    }
  };

  const handleLoadTemplate = (config: AgentConfig) => {
    onConfigChange(agent.id, config, agent.enabled);
    setIsLoadModalOpen(false);
  };

  const compatibleTemplates = templates.filter(t => t.agentType === agent.type);

  const renderConfigPanel = () => {
    switch (agent.type) {
      case AgentType.MONITORING_VITAL_SIGNS:
        return <MonitoringAgentConfigPanel agent={agent} onConfigChange={onConfigChange} />;
      case AgentType.MONITORING_VENTILATOR:
        return <VentilatorAgentConfigPanel agent={agent} onConfigChange={onConfigChange} allKnowledgeSources={allKnowledgeSources} />;
      case AgentType.CONVERSATIONAL_CHATBOT:
        return <ChatbotAgentConfigPanel agent={agent} onConfigChange={onConfigChange} allKnowledgeSources={allKnowledgeSources} />;
      case AgentType.REPORTING_SUMMARY:
        return <ReportingAgentConfigPanel agent={agent} onConfigChange={onConfigChange} />;
      default:
        return <p>이 에이전트 유형에 대한 설정이 없습니다.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{agent.description}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <span className={`text-sm font-medium ${agent.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {agent.enabled ? '활성' : '비활성'}
                </span>
                <ToggleSwitch enabled={agent.enabled} setEnabled={handleEnabledChange} />
            </div>
        </div>
      </Card>

      {renderConfigPanel()}

       <div className="flex justify-end pt-4 space-x-3">
        <button
          onClick={() => setIsLoadModalOpen(true)}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors"
        >
          템플릿 불러오기
        </button>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-colors"
        >
          템플릿으로 저장
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          변경사항 저장
        </button>
      </div>
      
      {/* Save Template Modal */}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="템플릿으로 저장">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">현재 구성을 나중에 재사용할 수 있도록 템플릿으로 저장합니다.</p>
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
              템플릿 이름
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="예: 소아과 집중 치료 설정"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>

      {/* Load Template Modal */}
      <Modal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} title="템플릿 불러오기">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {compatibleTemplates.length > 0 ? (
            compatibleTemplates.map(template => (
              <div key={template.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-800 font-medium">{template.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    aria-label={`Delete ${template.name}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                  </button>
                  <button
                    onClick={() => handleLoadTemplate(template.config)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm"
                  >
                    불러오기
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">이 에이전트 유형에 대해 저장된 템플릿이 없습니다.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgentConfigPanel;