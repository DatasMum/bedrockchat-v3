import { create } from 'zustand';
import { Model } from '../@types/conversation';
import { AVAILABLE_MODEL_KEYS } from '../constants/index';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from './useLocalStorage';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

// Models available in Sydney (ap-southeast-2) region
const SYDNEY_REGION_MODELS = [
  'claude-v3-sonnet',
  'claude-v3-haiku',
  'claude-v3.5-sonnet',
  'claude-v3.5-sonnet-v2',
  'claude-v3.7-sonnet',
  'amazon-titan-text-express-v1',
  'amazon-titan-text-lite-v1',
  'amazon-titan-embed-text-v1',
  'amazon-titan-embed-image-v1',
  'mistral-large',
  'mistral-large-2',
];

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

const DEFAULT_MODEL: Model = 'claude-v3.5-v2-sonnet';

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
      // Filter to only include models available in Sydney region
      const sydneyActiveModels = { ...activeModels };
      Object.keys(sydneyActiveModels).forEach(key => {
        const modelId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (!SYDNEY_REGION_MODELS.includes(modelId)) {
          sydneyActiveModels[key as keyof ActiveModels] = false;
        }
      });
      return sydneyActiveModels;
    }

    // Create a new object with only Sydney region models set to true
    return AVAILABLE_MODEL_KEYS.reduce((acc: ActiveModels, model: Model) => {
      // Set model to true only if it's available in Sydney region
      acc[toCamelCase(model) as keyof ActiveModels] = SYDNEY_REGION_MODELS.includes(model);
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
    // Get all models but filter to only include those available in Sydney region
    const allModels = [
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
      {
        modelId: 'claude-v3-sonnet',
        label: t('model.claude-v3-sonnet.label'),
        description: t('model.claude-v3-sonnet.description'),
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
      // Amazon Titan models
      {
        modelId: 'amazon-titan-text-express-v1',
        label: t('model.amazon-titan-text-express-v1.label', 'Amazon Titan Text Express v1'),
        description: t('model.amazon-titan-text-express-v1.description', 'Amazon Titan Text Express model for general text generation'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'amazon-titan-text-lite-v1',
        label: t('model.amazon-titan-text-lite-v1.label', 'Amazon Titan Text Lite v1'),
        description: t('model.amazon-titan-text-lite-v1.description', 'Amazon Titan Text Lite model for efficient text generation'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'amazon-titan-embed-text-v1',
        label: t('model.amazon-titan-embed-text-v1.label', 'Amazon Titan Embed Text v1'),
        description: t('model.amazon-titan-embed-text-v1.description', 'Amazon Titan Embed Text model for text embeddings'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'amazon-titan-embed-image-v1',
        label: t('model.amazon-titan-embed-image-v1.label', 'Amazon Titan Embed Image v1'),
        description: t('model.amazon-titan-embed-image-v1.description', 'Amazon Titan Embed Image model for image embeddings'),
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
    
    // Filter to only include models available in Sydney region
    return allModels.filter(model => SYDNEY_REGION_MODELS.includes(model.modelId));
  }, [t]);

  const [filteredModels, setFilteredModels] = useState(availableModels);
  const { modelId, setModelId } = useModelState();
  const [recentUseModelId, setRecentUseModelId] = useLocalStorage(
    'recentUseModelId',
    DEFAULT_MODEL
  );

  // Save the model id by each bot
  const [botModelId, setBotModelId] = useLocalStorage(
    botId ? `bot_model_${botId}` : 'temp_model',
    ''
  );

  // Update filtered models when activeModels changes
  useEffect(() => {
    if (processedActiveModels) {
      const filtered = availableModels.filter((model) => {
        const key = toCamelCase(model.modelId) as keyof ActiveModels;
        return processedActiveModels[key] !== false;
      });
      setFilteredModels(filtered);
    }
  }, [processedActiveModels, availableModels]);

  const getDefaultModel = useCallback(() => {
    // check default model is available
    const defaultModelAvailable = filteredModels.some(
      (m) => m.modelId === DEFAULT_MODEL
    );
    if (defaultModelAvailable) {
      return DEFAULT_MODEL;
    }
    // If the default model is not available, select the first model on the list
    return filteredModels[0]?.modelId ?? DEFAULT_MODEL;
  }, [filteredModels]);

  // select the model via list of activeModels
  const selectModel = useCallback(
    (targetModelId: Model) => {
      const modelExists = filteredModels.some(
        (m) => toCamelCase(m.modelId) === toCamelCase(targetModelId)
      );
      return modelExists ? targetModelId : getDefaultModel();
    },
    [filteredModels, getDefaultModel]
  );

  useEffect(() => {
    if (processedActiveModels === undefined) {
      return;
    }

    // botId is changed
    if (previousBotId !== botId) {
      // BotId is undefined, select recent modelId
      if (!botId) {
        setModelId(selectModel(recentUseModelId as Model));
        return;
      }

      // get botModelId from localStorage
      // When acquired from botModelID, settings for previousBotID are acquired, so a key is specified and acquired directly from local storage.
      const botModelId = localStorage.getItem(`bot_model_${botId}`);

      // modelId is in the the LocalStorage. use the saved modelId.
      if (botModelId) {
        setModelId(selectModel(botModelId as Model));
      } else {
        // If there is no bot-specific model ID, check if the last model used can be used
        const lastModelAvailable = filteredModels.some(
          (m) => m.modelId === recentUseModelId
        );

        // If the last model used is available, use it.
        if (lastModelAvailable) {
          setModelId(selectModel(recentUseModelId as Model));
          return;
        } else {
          // Use the default model if not available
          setModelId(selectModel(getDefaultModel()));
        }
      }
    } else {
      // Processing when botId and previousBotID are the same, but there is an update in FilteredModels
      if (botId) {
        const lastModelAvailable = filteredModels.some(
          (m) =>
            toCamelCase(m.modelId) === toCamelCase(recentUseModelId) ||
            toCamelCase(m.modelId) === toCamelCase(botModelId)
        );
        if (!lastModelAvailable) {
          setModelId(selectModel(getDefaultModel()));
        } else {
          setModelId(selectModel(recentUseModelId as Model));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const model = useMemo(() => {
    return filteredModels.find(
      (model) => toCamelCase(model.modelId) === toCamelCase(modelId)
    );
  }, [filteredModels, modelId]);

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
    availableModels: filteredModels,
    forceReasoningEnabled: model?.forceReasoningEnabled ?? false,
  };
};

export default useModel;
