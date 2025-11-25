import React from 'react';
import { Agent, ChatbotConfig, BehavioralRule, KnowledgeSource, KnowledgeSourceType, MedicalLiteratureSearchConfig, EvaluationMetricConfig } from '../../types';
import Card from '../common/Card';
import Select from '../common/Select';
import LiteratureSearchConfigCard from '../common/LiteratureSearchConfigCard';
import EvaluationMetricCard from '../common/EvaluationMetricCard';

interface ChatbotAgentConfigPanelProps {
  agent: Agent<ChatbotConfig>;
  onConfigChange: (agentId: string, newConfig: ChatbotConfig) => void;
  allKnowledgeSources: KnowledgeSource[];
}

const TYPE_COLORS: Record<string, string> = {
    [KnowledgeSourceType.PROTOCOL]: 'bg-blue-100 text-blue-800',
    [KnowledgeSourceType.GUIDELINE]: 'bg-green-100 text-green-800',
    [KnowledgeSourceType.RECOMMENDATION]: 'bg-yellow-100 text-yellow-800',
    [KnowledgeSourceType.TEXTBOOK]: 'bg-indigo-100 text-indigo-800',
    [KnowledgeSourceType.PRO]: 'bg-purple-100 text-purple-800',
    [KnowledgeSourceType.CUSTOM]: 'bg-gray-200 text-gray-800',
};

const LockClosedIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);


const ChatbotAgentConfigPanel: React.FC<ChatbotAgentConfigPanelProps> = ({ agent, onConfigChange, allKnowledgeSources }) => {
  const { config } = agent;

  const handlePersonaChange = (value: 'clinical' | 'empathetic' | 'direct') => {
    onConfigChange(agent.id, { ...config, persona: value });
  };

  const handleToggleSourceReference = (sourceId: string) => {
    const currentIds = config.knowledgeSourceIds || [];
    const newIds = currentIds.includes(sourceId)
        ? currentIds.filter(id => id !== sourceId)
        : [...currentIds, sourceId];
    onConfigChange(agent.id, { ...config, knowledgeSourceIds: newIds });
  };
  
  const handleRuleUpdate = (updatedRule: BehavioralRule) => {
    const newRules = config.rules.map(rule => rule.id === updatedRule.id ? updatedRule : rule);
    onConfigChange(agent.id, { ...config, rules: newRules });
  };
  
  const addRule = () => {
    const newRule: BehavioralRule = { id: `rule-${Date.now()}`, condition: '', matchType: 'any', responses: [''], escalation: 'none', tags: [], isDeletable: true };
    onConfigChange(agent.id, { ...config, rules: [...config.rules, newRule] });
  };

  const removeRule = (ruleId: string) => {
    const newRules = config.rules.filter(rule => rule.id !== ruleId);
    onConfigChange(agent.id, { ...config, rules: newRules });
  };
  
  const handleLiteratureSearchChange = (literatureSearchConfig: MedicalLiteratureSearchConfig) => {
    onConfigChange(agent.id, { ...config, literatureSearch: literatureSearchConfig });
  };

  const handleEvaluationChange = (evaluationConfig: EvaluationMetricConfig) => {
    onConfigChange(agent.id, { ...config, evaluation: evaluationConfig });
  };

  const systemRules = config.rules.filter(rule => rule.isDeletable === false);
  const customRules = config.rules.filter(rule => rule.isDeletable !== false);

  const renderRule = (rule: BehavioralRule) => (
    <div key={rule.id} className={`p-4 rounded-lg border space-y-4 ${rule.isDeletable !== false ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex justify-between items-start">
            <div>
                <label className="block text-sm font-medium text-gray-700">조건 (IF)</label>
                <p className="text-xs text-gray-500 mb-1">사용자 메시지에 다음 키워드 중 하나라도 포함될 경우 규칙이 실행됩니다 (쉼표로 구분).</p>
            </div>
            {rule.isDeletable === false && (
                <div className="flex items-center text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-1">
                    <LockClosedIcon className="h-3 w-3 mr-1" />
                    <span>기본 규칙</span>
                </div>
            )}
        </div>
        <input
            type="text"
            value={rule.condition}
            onChange={(e) => handleRuleUpdate({ ...rule, condition: e.target.value })}
            placeholder="예: 불안, 걱정, 무서워요"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <div className="flex items-center space-x-4 mt-2">
            <label className="text-xs font-medium text-gray-600">키워드 일치 조건:</label>
            <div className="flex items-center">
                <input id={`match-any-${rule.id}`} type="radio" value="any" checked={rule.matchType === 'any'} onChange={() => handleRuleUpdate({ ...rule, matchType: 'any' })} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <label htmlFor={`match-any-${rule.id}`} className="ml-2 text-xs text-gray-700">하나라도 포함 (OR)</label>
            </div>
            <div className="flex items-center">
                <input id={`match-all-${rule.id}`} type="radio" value="all" checked={rule.matchType === 'all'} onChange={() => handleRuleUpdate({ ...rule, matchType: 'all' })} className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <label htmlFor={`match-all-${rule.id}`} className="ml-2 text-xs text-gray-700">모두 포함 (AND)</label>
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">응답 (THEN)</label>
            <div className="space-y-2">
            {rule.responses.map((response, index) => (
                <div key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full h-5 w-5 flex items-center justify-center mt-2">{index + 1}</div>
                    <textarea
                        value={response}
                        onChange={(e) => {
                            const newResponses = [...rule.responses];
                            newResponses[index] = e.target.value;
                            handleRuleUpdate({ ...rule, responses: newResponses });
                        }}
                        placeholder={`메시지 #${index + 1}`}
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button 
                        onClick={() => {
                            if (rule.responses.length > 1) {
                                const newResponses = rule.responses.filter((_, i) => i !== index);
                                handleRuleUpdate({ ...rule, responses: newResponses });
                            }
                        }} 
                        disabled={rule.responses.length <= 1}
                        className="p-1 text-gray-400 rounded-md hover:bg-gray-200 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent mt-1"
                        aria-label="응답 삭제"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            </div>
            <button onClick={() => handleRuleUpdate({ ...rule, responses: [...rule.responses, ''] })} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800">
            + 응답 추가
            </button>
        </div>

        <div className="space-y-4">
            <Select
                label="추가 조치 (ACTION)"
                value={rule.escalation}
                onChange={(value) => handleRuleUpdate({ ...rule, escalation: value })}
                options={[
                    { value: 'none', label: '없음' },
                    { value: 'nurse_alert', label: '간호사에게 긴급 알림' },
                    { value: 'doctor_review', label: '의사 검토 목록에 추가' },
                ]}
                description="메시지 전송 후 실행할 추가적인 시스템 동작을 선택합니다."
            />
                <div>
                <label htmlFor={`tags-${rule.id}`} className="block text-sm font-medium text-gray-700">대화 태그 (TAGS)</label>
                <p className="text-xs text-gray-500 mb-1">분석 및 검토를 위해 대화에 적용할 태그를 입력하세요 (쉼표로 구분).</p>
                <input
                    type="text"
                    id={`tags-${rule.id}`}
                    value={rule.tags?.join(', ') || ''}
                    onChange={(e) => handleRuleUpdate({ ...rule, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="예: emotional_support, technical_issue"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
            </div>
        </div>

        {rule.isDeletable !== false && (
            <div className="flex justify-end pt-3 mt-2 border-t">
                <button onClick={() => removeRule(rule.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    규칙 삭제
                </button>
            </div>
        )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card title="챗봇 페르소나" description="챗봇의 소통 스타일을 정의하세요.">
         <div className="mt-4">
            <Select
                label="소통 톤"
                value={config.persona}
                onChange={handlePersonaChange}
                options={[
                { value: 'clinical', label: '전문적 & 격식체' },
                { value: 'empathetic', label: '공감적 & 지지적' },
                { value: 'direct', label: '간결 & 직접적' },
                ]}
                description="챗봇 응답의 전반적인 톤을 설정합니다."
            />
         </div>
      </Card>
      
      <Card title="참조 Knowledge DB" description="챗봇이 답변을 위해 참조할 지식 소스를 선택하세요. 전체 Knowledge DB는 'Knowledge DB' 메뉴에서 관리할 수 있습니다.">
        <div className="space-y-2 mt-4">
            {allKnowledgeSources.map(source => {
                const isSelected = config.knowledgeSourceIds.includes(source.id);
                const isEnabledInKB = source.enabled;
                const typeColor = TYPE_COLORS[source.type as KnowledgeSourceType] || TYPE_COLORS[KnowledgeSourceType.CUSTOM];
                
                return (
                    <div key={source.id} className={`flex items-center justify-between p-3 rounded-lg border ${!isEnabledInKB ? 'bg-gray-100 opacity-60' : 'bg-gray-50'}`}>
                        <div className="flex items-start flex-1 pr-4">
                            <input
                                id={`ks-ref-${source.id}`}
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSourceReference(source.id)}
                                disabled={!isEnabledInKB}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            <div className="ml-3">
                                <label htmlFor={`ks-ref-${source.id}`} className={`text-sm font-medium ${!isEnabledInKB ? 'text-gray-500' : 'text-gray-800'}`}>{source.name}</label>
                                <div className="flex items-center gap-x-2 mt-1">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}`}>
                                        {source.type}
                                    </span>
                                    {source.description && <p className="text-xs text-gray-500 hidden sm:block">{source.description}</p>}
                                </div>
                                {!isEnabledInKB && <p className="text-xs text-red-500 mt-1">이 소스는 전체 Knowledge DB에서 비활성화되어 있습니다.</p>}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
      </Card>

      <Card title="행동 규칙" description="복잡한 '조건-응답-조치' 규칙을 만들어 특정 상황에 대한 챗봇의 반응을 정교하게 제어하세요.">
        <div className="space-y-6 mt-4">
            {systemRules.length > 0 && (
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">시스템 기본 규칙</h4>
                    <div className="space-y-4">
                        {systemRules.map(renderRule)}
                    </div>
                </div>
            )}
            
            <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2">사용자 정의 규칙</h4>
                 <div className="space-y-4">
                    {customRules.map(renderRule)}
                    <button onClick={addRule} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                        + 새 규칙 추가
                    </button>
                 </div>
            </div>
        </div>
      </Card>
      
      <LiteratureSearchConfigCard 
        config={config.literatureSearch}
        onConfigChange={handleLiteratureSearchChange}
      />

      <EvaluationMetricCard
        config={config.evaluation}
        onConfigChange={handleEvaluationChange}
      />
    </div>
  );
};

export default ChatbotAgentConfigPanel;