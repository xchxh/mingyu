export function shouldShowPromptShareButton(options: {
  viewportWidth: number;
  hasNavigatorShare: boolean;
}) {
  return options.viewportWidth < 1024 && options.hasNavigatorShare;
}

export function buildBaziCustomPromptPatch() {
  return {
    baziPresetId: 'ai-mingge-zonglun',
    baziQuickQuestion: '',
  };
}

export function buildZiweiCustomPromptPatch() {
  return {
    ziweiTopic: 'chat',
    ziweiQuickQuestion: '',
  };
}
