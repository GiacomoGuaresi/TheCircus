export const IPC = {
  // Generation
  GENERATE: 'generate',
  GENERATION_PROGRESS: 'generation:progress',
  GENERATION_COMPLETE: 'generation:complete',

  // Scheduler
  SCHEDULER_START: 'scheduler:start',
  SCHEDULER_STOP: 'scheduler:stop',
  SCHEDULER_STATUS: 'scheduler:status',
  SCHEDULER_TICK_START: 'scheduler:tick-start',
  SCHEDULER_TICK_COMPLETE: 'scheduler:tick-complete',
  SCHEDULER_TICK_ERROR: 'scheduler:tick-error',

  // Characters
  CHARACTERS_LIST: 'characters:list',
  CHARACTER_GET: 'character:get',
  CHARACTER_SAVE: 'character:save',
  CHARACTER_DELETE: 'character:delete',

  // Diary
  DIARY_RECENT: 'diary:recent',
  DIARY_SEARCH: 'diary:search',
  DIARY_GET: 'diary:get',
  DIARY_INDEX: 'diary:index',

  // Config
  CONFIG_GET: 'config:get',
  CONFIG_SAVE: 'config:save',
  CONFIG_RESET: 'config:reset',

  // Status
  STATUS_AI_IMAGE: 'status:ai-image',
  STATUS_AI_LLM: 'status:ai-llm',
  STATUS_DESKTOP: 'status:desktop',

  // App
  APP_VERSION: 'app:version',
  OPEN_DATA_DIR: 'app:open-data-dir'
} as const
