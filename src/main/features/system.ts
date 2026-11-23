import type { Feature } from '../commands'
import { settings } from '../settings'

export default {
  commands: {
    'system:info': () => {
      const cfg = settings()
      return { zone: cfg.SCHOOL_TIMEZONE, mode: cfg.DB_MODE }
    },
  },
} satisfies Feature
