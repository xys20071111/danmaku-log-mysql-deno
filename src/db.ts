import { config } from './config.ts';
import { MysqlClient } from './deps.ts';

const client = new MysqlClient()
const db = await client.connect({
    username: config.username,
    password: config.password,
    db: config.db,
    hostname: config.host,
    port: config.port,
    poolSize: 10,
})

export { db }