import { EventEmitter } from './deps.ts'
import { config } from './config.ts'
import { db } from './db.ts'

db.query('CREATE TABLE IF NOT EXISTS`log` ( `id` INT NOT NULL AUTO_INCREMENT , `time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , `roomId` INT NOT NULL , `uid` BIGINT UNSIGNED NOT NULL , `nickname` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL, `text` VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;');
let ws = new WebSocket(`ws://127.0.0.1:${config.apiPort}`)
const APIMsgHandler = new EventEmitter()

interface IMessage {
    cmd: string
    data: any
}

function registerCallback() {
    ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ cmd: "AUTH", data: config.token }))
    })
    ws.addEventListener('close', () => {
        ws = new WebSocket(`ws://127.0.0.1:${config.apiPort}`)
        registerCallback()
    })
    ws.addEventListener('message', (event) => {
        const msg: IMessage = JSON.parse(event.data)
        APIMsgHandler.emit(msg.cmd, msg.data)
    })
}

registerCallback()

APIMsgHandler.on('AUTH', (result: string) => {
    if (result === 'AUTHED') {
        ws.send(JSON.stringify({ cmd: "ROOMID", data: config.token }));
    } else {
        console.log('[弹幕日志插件] 认证失败');
    }
})

APIMsgHandler.on('ROOMID', (roomId: number) => {
    console.log(`[弹幕日志插件] 工作在${roomId}`);
    APIMsgHandler.on('DANMU_MSG', (data: Array<any>) => {
        db.execute('INSERT INTO `log`(`roomId` ,`uid`, `nickname`, `text`) VALUES(?, ?, ?, ?)', [roomId, data[2][0], data[2][1], data[1]])
            .catch((reason: Error) => {
                console.error(`[弹幕日志插件] 写日志失败 弹幕信息 ${data[2][0]} ${data[2][1]} ${data[1]}`);
                console.log((reason as Error).message);
            });

    });
    APIMsgHandler.on('SUPER_CHAT_MESSAGE', (data: any) => {
        db.execute('INSERT INTO `log`(`roomId` ,`uid`, `nickname`, `text`) VALUES(?, ?, ?, ?)', [roomId, data['uid'], data['user_info']['uname'], data['message']])
            .catch((reason: Error) => {
                console.error(`[弹幕日志插件] 写日志失败 弹幕信息 ${data[2][0]} ${data[2][1]} ${data[1]}`);
                console.log((reason as Error).message);
            });
    });
})

Deno.addSignalListener('SIGTERM', () => {
    Deno.exit()
})

Deno.addSignalListener('SIGINT', () => {
    Deno.exit()
})

globalThis.addEventListener('unload', () => {
    console.log(`[弹幕日志插件] 插件退出`);
})