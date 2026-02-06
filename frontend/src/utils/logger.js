const isDev = Boolean(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV);

const logger = {
  debug: (...args) => {
    if (isDev) console.debug(...args)
  },
  info: (...args) => {
    if (isDev) console.info(...args)
  },
  error: (...args) => {
    if (isDev) console.error(...args)
  }
}

export default logger
