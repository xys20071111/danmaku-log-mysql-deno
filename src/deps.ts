import * as events from 'https://deno.land/x/events@v1.0.0/mod.ts'

const EventEmitter = events.default
export { EventEmitter }
export { Client as MysqlClient } from "https://deno.land/x/mysql@v2.11.0/mod.ts"