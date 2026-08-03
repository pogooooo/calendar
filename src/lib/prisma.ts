import { PrismaClient } from '@prisma/client/wasm'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getCloudflareContext } from '@opennextjs/cloudflare'

type D1Binding = ConstructorParameters<typeof PrismaD1>[0]

let cached: PrismaClient | undefined

function getClient(): PrismaClient {
    if (cached) return cached

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
