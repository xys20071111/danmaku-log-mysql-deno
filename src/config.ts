import { UTF8Decorder } from './enconding.ts'

export interface IConfig {
    apiPort: number
    username: string
    password: string
    host: string
    port: number
    db: string
    token: string
}

export const config: IConfig = JSON.parse(UTF8Decorder.decode(Deno.readFileSync(Deno.args[0])))