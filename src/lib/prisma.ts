import { PrismaClient } from '@prisma/client/wasm'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type D1Binding = ConstructorParameters<typeof PrismaD1>[0]

let cached: PrismaClient | undefined

const isNodeDev =
    process.env.NODE_ENV === 'development' &&
    typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair === 'undefined'

function createDevClient(): PrismaClient {
    const req = eval('require') as NodeRequire
    const fs = req('fs') as typeof import('fs')
    const path = req('path') as typeof import('path')

    const dir = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject')
    const file = fs.existsSync(dir) ? fs.readdirSync(dir).find(f => f.endsWith('.sqlite')) : undefined

    if (!file) {
        throw new Error(
            '로컬 D1 데이터베이스가 없습니다. 먼저 스키마를 적용하세요: ' +
            'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > d1-schema.sql ' +
            '&& npx wrangler d1 execute cronos --local --file=d1-schema.sql',
        )
    }

    const mod = req(path.join(process.cwd(), 'src', 'generated', 'dev-client')) as {
        PrismaClient: new (opts: { datasourceUrl: string }) => unknown
    }

    return new mod.PrismaClient({
        datasourceUrl: 'file:' + path.join(dir, file).replace(/\\/g, '/'),
    }) as PrismaClient
}

function getClient(): PrismaClient {
    if (cached) return cached

    if (isNodeDev) {
        cached = createDevClient()
        return cached
    }

    const { env } = getCloudflareContext()
    const d1 = (env as unknown as Record<string, unknown>).DB as D1Binding

    cached = new PrismaClient({ adapter: new PrismaD1(d1) })
    return cached
}

const client = new Proxy({} as PrismaClient, {
    get(_target, prop, receiver) {
        return Reflect.get(getClient() as object, prop, receiver)
    },
})

export default client

/** 유일 제약 위반(P2002) — 겹쳐 들어온 두 요청이 같은 줄을 만들려 할 때. 500 대신 "이미 있음" 으로 다룬다 */
export const isUniqueViolation = (e: unknown) =>
    typeof e === 'object' && e !== null && (e as { code?: unknown }).code === 'P2002'
