import { create } from 'zustand';
import { Model } from '../@types/conversation';
import { AVAILABLE_MODEL_KEYS, SYDNEY_REGION_MODELS } from '../constants/index';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from './useLocalStorage';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

const CLAUDE_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const NOVA_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const LLAMA_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const DEFAULT_MODEL: Model = 'claude-v3.5-sonnet-v2';

const useModelState = create<{
  modelId: Model;
  setModelId: (m: Model) => void;
}>((set) => ({
  modelId: DEFAULT_MODEL,
  setModelId: (m) => {
    set({
      modelId: m,
    });
  },
}));

// Store the Previous BotId
const usePreviousBotId = (botId: string | null | undefined) => {
  const ref = useRef<string | null | undefined>();

  useEffect(() => {
    ref.current = botId;
  }, [botId]);

  return ref.current;
};

const useModel = (botId?: string | null, activeModels?: ActiveModels) => {
  const processedActiveModels = useMemo(() => {
    // Early return if activeModels is provided and not empty
    if (activeModels && Object.keys(activeModels).length > 0) {
      return activeModels;
    }

    // Create a new object with all models set to true
    return AVAILABLE_MODEL_KEYS.reduce((acc: ActiveModels, model: Model) => {
      // Optimize string replacement by doing it in one operation
      acc[toCamelCase(model) as keyof ActiveModels] = true;
      return acc;
    }, {} as ActiveModels);
  }, [activeModels]);

  const { t } = useTranslation();
  const previousBotId = usePreviousBotId(botId);

  const availableModels = useMemo<
    {
      modelId: Model;
      label: string;
      supportMediaType: string[];
      supportReasoning: boolean;
      forceReasoningEnabled?: boolean;
      description?: string;
    }[]
  >(() => {
    return [
      {
        modelId: 'claude-v4-opus',
        label: t('model.claude-v4-opus.label'),
        description: t('model.claude-v4-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4-sonnet',
        label: t('model.claude-v4-sonnet.label'),
        description: t('model.claude-v4-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v3-haiku',
        label: t('model.claude-v3-haiku.label'),
        description: t('model.claude-v3-haiku.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-haiku',
        label: t('model.claude-v3.5-haiku.label'),
        description: t('model.claude-v3.5-haiku.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-sonnet',
        label: t('model.claude-v3.5-sonnet.label'),
        description: t('model.claude-v3.5-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-sonnet-v2',
        label: t('model.claude-v3.5-sonnet-v2.label'),
        description: t('model.claude-v3.5-sonnet-v2.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.7-sonnet',
        label: t('model.claude-v3.7-sonnet.label'),
        description: t('model.claude-v3.7-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v3-opus',
        label: t('model.claude-v3-opus.label'),
        description: t('model.claude-v3-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      // New Amazon Nova models
      {
        modelId: 'amazon-nova-pro',
        label: t('model.amazon-nova-pro.label'),
        description: t('model.amazon-nova-pro.description'),
        supportMediaType: NOVA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'amazon-nova-lite',
        label: t('model.amazon-nova-lite.label'),
        description: t('model.amazon-nova-lite.description'),
        supportMediaType: NOVA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'amazon-nova-micro',
        label: t('model.amazon-nova-micro.label'),
        description: t('model.amazon-nova-micro.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      // DeepSeek models
      {
        modelId: 'deepseek-r1',
        label: t('model.deepseek-r1.label'),
        description: t('model.deepseek-r1.description'),
        supportMediaType: [],
        supportReasoning: true,
        forceReasoningEnabled: true, // Deep Seek always return reasoning contents.
      },
      // Meta Llama 3 models
      {
        modelId: 'llama3-3-70b-instruct',
        label: t('model.llama3-3-70b-instruct.label'),
        description: t('model.llama3-3-70b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-1b-instruct',
        label: t('model.llama3-2-1b-instruct.label'),
        description: t('model.llama3-2-1b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-3b-instruct',
        label: t('model.llama3-2-3b-instruct.label'),
        description: t('model.llama3-2-3b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-11b-instruct',
        label: t('model.llama3-2-11b-instruct.label'),
        description: t('model.llama3-2-11b-instruct.description'),
        supportMediaType: LLAMA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-90b-instruct',
        label: t('model.llama3-2-90b-instruct.label'),
        description: t('model.llama3-2-90b-instruct.description'),
        supportMediaType: LLAMA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      // Mistral
      {
        modelId: 'mistral-7b-instruct',
        label: t('model.mistral-7b-instruct.label'),
        description: t('model.mistral-7b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mixtral-8x7b-instruct',
        label: t('model.mixtral-8x7b-instruct.label'),
        description: t('model.mixtral-8x7b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mistral-large',
        label: t('model.mistral-large.label'),
        description: t('model.mistral-large.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mistral-large-2',
        label: t('model.mistral-large-2.label'),
        description: t('model.mistral-large-2.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
    ];
  }, [t]);

  // Filter the models only at the return point
  const sydneyFilteredModels = filteredModels.filter(model => 
    SYDNEY_REGION_MODELS.includes(model.modelId as any)
  );

  return {
    modelId,
    setModelId: (model: Model) => {
      setRecentUseModelId(model);
      if (botId) {
        setBotModelId(model);
      }
      setModelId(model);
    },
    model,
    disabledImageUpload: (model?.supportMediaType.length ?? 0) === 0,
    acceptMediaType:
      model?.supportMediaType.flatMap((mediaType) => {
        const ext = mediaType.split('/')[1];
        return ext === 'jpeg' ? ['.jpg', '.jpeg'] : [`.${ext}`];
      }) ?? [],
    // Only return Sydney region models
    availableModels: sydneyFilteredModels,
    forceReasoningEnabled: model?.forceReasoningEnabled ?? false,
  };
};

export default useModel;
