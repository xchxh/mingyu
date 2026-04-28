import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAISettings } from '@/hooks/useAISettings';
import { fetchAvailableModels, streamChatCompletion } from '@/lib/ai-service';
import {
    loadPersonalHistory,
    loadCompatibilityHistory,
    loadDivinationHistory,
} from '@/lib/history-records';
import { calculateFullBaziChart } from '@/lib/full-chart-engine';
import { buildPromptFromConfig, getCompatibilityPrompt } from '@/utils/ai/aiPrompts';



type HistoryTab = 'personal' | 'compatibility' | 'divination';

export function AIPanel() {
    const [settings, updateSettings] = useAISettings();
    const [activeTab, setActiveTab] = useState<HistoryTab>('personal');
    const [models, setModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

    const [personalRecords, setPersonalRecords] = useState<any[]>([]);
    const [compatRecords, setCompatRecords] = useState<any[]>([]);
    const [divinationRecords, setDivinationRecords] = useState<any[]>([]);

    const [selectedRecordId, setSelectedRecordId] = useState<string>('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    const [response, setResponse] = useState('');
    const responseEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPersonalRecords(loadPersonalHistory());
        setCompatRecords(loadCompatibilityHistory());
        setDivinationRecords(loadDivinationHistory());
    }, []);

    useEffect(() => {
        setSelectedRecordId('');
        setResponse('');
    }, [activeTab]);

    useEffect(() => {
        if (responseEndRef.current && isInterpreting) {
            responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [response, isInterpreting]);

    const handleFetchModels = async () => {
        const baseUrl = (settings.baseUrl || '').trim();
        const key = (settings.apiKey || '').trim();
        if (!baseUrl || !key) {
            alert('请输入 Base URL 和 API Key');
            return;
        }
        setIsFetchingModels(true);
        try {
            const data = await fetchAvailableModels(baseUrl, key);
            setModels(data);
            if (data.length > 0 && !settings.modelId) {
                updateSettings({ modelId: data[0].id });
            } else if (data.length > 0 && !data.find((m: any) => m.id === settings.modelId)) {
                updateSettings({ modelId: data[0].id });
            }
            alert('成功获取可用模型！');
        } catch (e: any) {
            alert(`获取失败：${e.message}`);
        } finally {
            setIsFetchingModels(false);
        }
    };

    const handleSendToAI = async () => {
        if (!settings.baseUrl || !settings.apiKey || !settings.modelId) {
            alert('请打开AI配置补全 Base URL、API Key 与 模型信息！');
            setConfigOpen(true);
            return;
        }
        if (!selectedRecordId) {
            alert('请先选择要解读的历史记录！');
            return;
        }

        let systemPrompt = '你是一个资深命理师。';
        let userPrompt = '';

        if (activeTab === 'personal') {
            const record = personalRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;
            const baziResult = calculateFullBaziChart(record.input as any);
            // 使用 BAZI_AI_PROMPTS.single 中的 "ai-mingge-zonglun" 解读
            const promptObj = buildPromptFromConfig('请综合解读该命理信息。', {
                id: 'ai-mingge-zonglun',
                prompt: '综合解读',
                scene: 'general'
            }, baziResult as any);
            systemPrompt = promptObj.system;
            userPrompt = promptObj.user;
        } else if (activeTab === 'compatibility') {
            const record = compatRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;

            const baziResult1 = calculateFullBaziChart({ ...record.input, analysisMode: 'single' } as any);
            const baziResult2 = calculateFullBaziChart({
                ...record.input,
                analysisMode: 'single',
                name: record.input.partnerName,
                gender: record.input.partnerGender,
                year: record.input.partnerYear,
                month: record.input.partnerMonth,
                day: record.input.partnerDay,
                timeIndex: record.input.partnerTimeIndex,
                isLeapMonth: record.input.partnerIsLeapMonth,
                useTrueSolarTime: record.input.partnerUseTrueSolarTime,
                birthHour: record.input.partnerBirthHour,
                birthMinute: record.input.partnerBirthMinute,
                birthPlace: record.input.partnerBirthPlace,
                birthLongitude: record.input.partnerBirthLongitude,
                dateType: record.input.partnerDateType,
            } as any);

            const promptObj = getCompatibilityPrompt('请做合盘分析。', baziResult1 as any, baziResult2 as any, 'marriage');
            systemPrompt = promptObj.system;
            userPrompt = promptObj.user;
        } else if (activeTab === 'divination') {
            const record = divinationRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;
            systemPrompt = '你是一位资深占星与占卜专家。请使用生动、有帮助的语气提供占卜结果的分析。';
            userPrompt = `占卜问题：${record.question}
占卜结果详细信息：\n${record.session?.prompt || '暂无占卜明细'}\n\n请针对以上问题与所提取的信息得出结论并给出建议。`;
        }

        // 这里告诉AI不再直接使用 ### 这种丑陋的Markdown标题格式
        systemPrompt += `\n输出要求：请使用纯文本或极其简单的分段，请避免输出“### 标题”这种 Markdown 标题，如果你要分隔段落请使用带序号的文字即可。排版一定要优雅清新。`;

        setResponse('');
        setIsInterpreting(true);
        let currentResponse = '';

        try {
            await streamChatCompletion(
                settings.baseUrl,
                settings.apiKey,
                settings.modelId,
                systemPrompt,
                userPrompt,
                (chunk) => {
                    currentResponse += chunk;
                    setResponse(currentResponse);
                }
            );
        } catch (e: any) {
            alert(`解读过程中发生错误: ${e.message}`);
        } finally {
            setIsInterpreting(false);
        }
    };

    const renderHistoryList = () => {
        let list: any[] = [];
        if (activeTab === 'personal') list = personalRecords;
        if (activeTab === 'compatibility') list = compatRecords;
        if (activeTab === 'divination') list = divinationRecords;

        if (list.length === 0) {
            return <div className="ai-records-empty">暂无历史记录</div>;
        }

        return (
            <div className="ai-records-list">
                {list.map((record) => (
                    <button
                        key={record.id}
                        type="button"
                        className={`ai-record-item ${selectedRecordId === record.id ? 'active' : ''}`}
                        onClick={() => setSelectedRecordId(record.id)}
                    >
                        <div className="ai-record-title">
                            {activeTab === 'divination' ? record.question : record.name}
                        </div>
                        <div className="ai-record-meta">
                            {new Date(record.updatedAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="form-wrapper ai-wrapper">
            <section className="person-section ai-panel">
                <div className="person-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>AI 解读模块</h2>
                        <p>选择您的排盘记录以进行大模型自动分析</p>
                    </div>
                    <button
                        type="button"
                        className="ai-settings-toggle-btn"
                        onClick={() => setConfigOpen(!configOpen)}
                    >
                        {configOpen ? '收起配置' : '展开 AI 配置'}
                    </button>
                </div>

                {configOpen && (
                    <div className="ai-settings-card">
                        <div className="form-row">
                            <div className="form-item">
                                <label>API Base URL</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://api.openai.com/v1"
                                    value={settings.baseUrl}
                                    onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-item">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="sk-..."
                                    value={settings.apiKey}
                                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-row-flex" style={{ alignItems: 'flex-end', gap: '8px' }}>
                            <div className="form-item" style={{ flex: 1 }}>
                                <label>选择可用模型</label>
                                <select
                                    className="form-input"
                                    value={settings.modelId}
                                    onChange={(e) => updateSettings({ modelId: e.target.value })}
                                >
                                    <option value="">请先获取并选择模型...</option>
                                    {models.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                    {settings.modelId && !models.includes(settings.modelId) && (
                                        <option value={settings.modelId}>{settings.modelId}</option>
                                    )}
                                </select>
                            </div>
                            <button
                                type="button"
                                className="secondary-page-button"
                                style={{ height: '48px', padding: '0 16px', flexShrink: 0 }}
                                disabled={isFetchingModels}
                                onClick={handleFetchModels}
                            >
                                {isFetchingModels ? '获取中...' : '加载模型'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="ai-history-picker">
                    <div className="ai-tabs">
                        <button
                            type="button"
                            className={`ai-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            个人
                        </button>
                        <button
                            type="button"
                            className={`ai-tab-btn ${activeTab === 'compatibility' ? 'active' : ''}`}
                            onClick={() => setActiveTab('compatibility')}
                        >
                            合盘
                        </button>
                        <button
                            type="button"
                            className={`ai-tab-btn ${activeTab === 'divination' ? 'active' : ''}`}
                            onClick={() => setActiveTab('divination')}
                        >
                            占卜
                        </button>
                    </div>
                    {renderHistoryList()}
                </div>

                <div className="form-actions page-submit-actions" style={{ width: '100%', marginTop: '20px' }}>
                    <button
                        className="primary-button start-submit-button"
                        type="button"
                        style={{ width: '100%', opacity: isInterpreting || !selectedRecordId ? 0.6 : 1 }}
                        disabled={isInterpreting || !selectedRecordId}
                        onClick={handleSendToAI}
                    >
                        {isInterpreting ? '正在生成解读...' : '发送至 AI 解读'}
                    </button>
                </div>

                {response && (
                    <div className="ai-response-area">
                        <div className="ai-response-header">解读内容：</div>
                        <div className="ai-markdown-content">
                            <ReactMarkdown>{response}</ReactMarkdown>
                        </div>
                        <div ref={responseEndRef} />
                    </div>
                )}
            </section>
        </div>
    );
}
