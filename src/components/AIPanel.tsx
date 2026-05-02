import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAISettings } from '@/hooks/useAISettings';
import { fetchAvailableModels, streamChatCompletion } from '@/lib/ai-service';
import {
    loadPersonalHistory,
    loadCompatibilityHistory,
    loadDivinationHistory,
    loadAIReport,
    saveAIReport,
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
    const [showReport, setShowReport] = useState(false);
    const [viewingReport, setViewingReport] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const responseEndRef = useRef<HTMLDivElement>(null);

    // 显示状态消息（替代 alert）
    const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
        setStatusMessage({ type, message });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    // 处理双击查看报告
    const handleRecordDoubleClick = (record: any) => {
        const report = loadAIReport(record.id);
        if (report) {
            setViewingReport(report);
            setShowReport(true);
        }
    };

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
            showStatus('error', '请输入 Base URL 和 API Key');
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
            showStatus('success', data.length > 0 ? `成功获取 ${data.length} 个可用模型！` : '未获取到可用模型');
        } catch (e: any) {
            showStatus('error', `获取失败：${e.message}`);
        } finally {
            setIsFetchingModels(false);
        }
    };

    const handleSendToAI = async () => {
        if (!settings.baseUrl || !settings.apiKey || !settings.modelId) {
            showStatus('error', '请先配置 AI：填写 Base URL、API Key 并加载模型');
            setConfigOpen(true);
            return;
        }
        if (!selectedRecordId) {
            showStatus('error', '请先选择要解读的历史记录');
            return;
        }

        let systemPrompt = '你是一个资深命理师。';
        let userPrompt = '';

        if (activeTab === 'personal') {
            const record = personalRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;

            // 检查是否是未知时辰（-1 表示未知时辰）
            const hasUnknownTime = record.input.timeIndex == null || record.input.timeIndex === -1;

            if (hasUnknownTime) {
                // 未知时辰时，只使用三柱信息
                systemPrompt = '你是一个资深命理师。';
                userPrompt = `请根据以下三柱信息进行综合分析（时辰未知，应保守估计）：

${record.input.year}年 ${record.input.month}月 ${record.input.day}日
性别：${record.input.gender === 'male' ? '男' : '女'}

请综合解读该命理信息，时柱未知的情况下应保守估计，重点分析年柱、月柱、日柱的影响。`;
            } else {
                // 已知时辰，正常计算
                const inputWithDefault = {
                    ...record.input,
                    timeIndex: record.input.timeIndex,
                };
                const baziResult = calculateFullBaziChart(inputWithDefault as any);
                const promptObj = buildPromptFromConfig('请综合解读该命理信息。', {
                    id: 'ai-mingge-zonglun',
                    prompt: '综合解读',
                    scene: 'general'
                }, baziResult as any);
                systemPrompt = promptObj.system;
                userPrompt = promptObj.user;
            }
        } else if (activeTab === 'compatibility') {
            const record = compatRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;

            // 检查双方时辰是否未知
            const hasUnknownTime = record.input.timeIndex == null || record.input.timeIndex === -1;
            const hasUnknownPartnerTime = record.input.partnerTimeIndex == null || record.input.partnerTimeIndex === -1;

            if (hasUnknownTime || hasUnknownPartnerTime) {
                // 至少一方时辰未知，使用简化合盘分析
                systemPrompt = '你是一个资深命理师。';
                userPrompt = `请进行合盘分析（至少一方时辰未知，应保守估计）：

【主盘】
${record.input.year}年 ${record.input.month}月 ${record.input.day}日
性别：${record.input.gender === 'male' ? '男' : '女'}
时辰：${hasUnknownTime ? '未知' : record.input.timeIndex}时

【副盘】
${record.input.partnerYear}年 ${record.input.partnerMonth}月 ${record.input.partnerDay}日
性别：${record.input.partnerGender === 'male' ? '男' : '女'}
时辰：${hasUnknownPartnerTime ? '未知' : record.input.partnerTimeIndex}时

请做合盘分析，时柱未知的情况下应保守估计。`;
            } else {
                // 双方时辰都已知
                const inputWithDefault = {
                    ...record.input,
                    timeIndex: record.input.timeIndex,
                };
                const baziResult1 = calculateFullBaziChart({ ...inputWithDefault, analysisMode: 'single' } as any);
                const baziResult2 = calculateFullBaziChart({
                    ...inputWithDefault,
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
            }
        } else if (activeTab === 'divination') {
            const record = divinationRecords.find((r) => r.id === selectedRecordId);
            if (!record) return;
            systemPrompt = '你是一位资深占星与占卜专家。请使用生动、有帮助的语气提供占卜结果的分析。';
            userPrompt = `占卜问题：${record.question}
占卜结果详细信息：\n${record.session?.prompt || '暂无占卜明细'}\n\n请针对以上问题与所提取的信息得出结论并给出建议。`;
        }

        // 这里告诉AI不再直接使用 ### 这种丑陋的Markdown标题格式
        systemPrompt += `\n输出要求：请使用纯文本或极其简单的分段，请避免输出”### 标题”这种 Markdown 标题，如果你要分隔段落请使用带序号的文字即可。排版一定要优雅清新。`;

        setResponse('');
        setIsInterpreting(true);
        let currentResponse = '';
        let finalReport = '';

        try {
            const generator = streamChatCompletion(settings, userPrompt, systemPrompt);
            for await (const chunk of generator) {
                currentResponse += chunk;
                setResponse(currentResponse);
            }
            finalReport = currentResponse;

            // 保存报告到本地
            saveAIReport(selectedRecordId, finalReport);

            // 刷新历史记录以更新显示
            setPersonalRecords(loadPersonalHistory());
            setCompatRecords(loadCompatibilityHistory());
            setDivinationRecords(loadDivinationHistory());
        } catch (e: any) {
            showStatus('error', `解读失败：${e.message}`);
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
                {list.map((record) => {
                    const hasReport = loadAIReport(record.id);
                    return (
                        <button
                            key={record.id}
                            type="button"
                            className={`ai-record-item ${selectedRecordId === record.id ? 'active' : ''} ${hasReport ? 'has-report' : ''}`}
                            onClick={() => setSelectedRecordId(record.id)}
                            onDoubleClick={() => handleRecordDoubleClick(record)}
                            title={hasReport ? '双击查看报告' : ''}
                        >
                            <div className="ai-record-title">
                                {activeTab === 'divination' ? record.question : record.name}
                                {hasReport && <span className="ai-record-badge">已解读</span>}
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
                    );
                })}
            </div>
        );
    };

    return (
        <div className="form-wrapper ai-wrapper">
            {statusMessage && (
                <div className={`ai-status-message ${statusMessage.type}`}>
                    {statusMessage.message}
                </div>
            )}
            <section className="person-section ai-panel">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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
                                    value={settings.baseUrl || ''}
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
                                    value={settings.apiKey || ''}
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

                {showReport && (
                    <div className="ai-report-modal" onClick={() => setShowReport(false)}>
                        <div className="ai-report-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="ai-report-modal-header">
                                <h3>AI 报告</h3>
                                <button
                                    type="button"
                                    className="ai-report-modal-close"
                                    onClick={() => setShowReport(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="ai-report-modal-body">
                                <ReactMarkdown>{viewingReport}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
