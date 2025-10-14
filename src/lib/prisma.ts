import { PrismaClient } from '../generated/prisma'

// TypeScript에게 global 객체에 prisma 프로퍼티가 있을 수 있음을 알려줍니다.
declare global {
    var prisma: PrismaClient | undefined
}

// globalThis.prisma가 있으면 재사용하고, 없으면 새로 생성합니다.
// 개발 환경(NODE_ENV !== 'production')에서만 globalThis에 할당하여
// 핫 리로딩 시에도 인스턴스가 유지되도록 합니다.
const client = globalThis.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client
