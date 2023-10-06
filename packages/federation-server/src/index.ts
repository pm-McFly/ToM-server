import configParser, { type ConfigDescription } from '@twake/config-parser'
import { type TwakeLogger } from '@twake/logger'
import MatrixIdentityServer from '@twake/matrix-identity-server'
import { Router } from 'express'
import defaultConfig from './config.json'
import initializeDb from './db'
import Routes from './routes/routes'
import { type Config } from './types'
import fs from 'fs'

export default class FederationServer extends MatrixIdentityServer {
  routes = Router()
  declare conf: Config
  constructor(
    conf?: Partial<Config>,
    confDesc?: ConfigDescription,
    logger?: TwakeLogger
  ) {
    if (confDesc == null) confDesc = defaultConfig
    const serverConf = configParser(
      confDesc,
      /* istanbul ignore next */
      conf != null
        ? conf
        : process.env.TWAKE_FEDERATION_SERVER_CONF != null
        ? process.env.TWAKE_FEDERATION_SERVER_CONF
        : fs.existsSync('/etc/twake/federation-server.conf')
        ? '/etc/twake/federation-server.conf'
        : undefined
    ) as Config
    super(serverConf, confDesc, logger)
    this.conf.trusted_servers_addresses =
      process.env.TRUSTED_SERVERS_ADDRESSES?.match(/[^,"'\s[\]]+/g) ??
      this.conf.trusted_servers_addresses
    const superReady = this.ready
    this.ready = new Promise((resolve, reject) => {
      superReady
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        .then(() => {
          return initializeDb(this.db, this.conf, this.logger)
        })
        .then(() => {
          this.routes = Routes(this)
          resolve(true)
        })
        /* istanbul ignore next */
        .catch(reject)
    })
  }
}
