/**
 * 로컬 개발용 시드 — 테스트 계정을 하나 만든다.
 *
 *   node scripts/seed-dev.mjs
 *   node scripts/seed-dev.mjs --email me@example.com --password "Other1234!"
 *
 * 로컬 D1(miniflare) sqlite 에 직접 붙는다. 먼저 스키마가 적용돼 있어야 한다:
 *   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > d1-schema.sql
 *   npx wrangler d1 execute cronos --local --file=d1-schema.sql -y
 *
 * 이미 같은 이메일이 있으면 비밀번호만 다시 설정한다(멱등).
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const DEFAULTS = {
    email: "test@cronos.local",
    password: "Test1234!",
    name: "테스트",
};

function parseArgs(argv) {
    const out = { ...DEFAULTS };
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i].replace(/^--/, "");
        if (key in out && argv[i].startsWith("--")) {
            out[key] = argv[i + 1];
            i += 1;
        }
    }
    return out;
}

function localD1Url() {
    const dir = path.join(
        process.cwd(),
        ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject",
    );
    if (!fs.existsSync(dir)) {
        throw new Error(
            "로컬 D1 이 없습니다. 먼저 스키마를 적용하세요 (파일 상단 주석 참고).",
        );
    }
    const file = fs.readdirSync(dir).find((f) => f.endsWith(".sqlite"));
    if (!file) throw new Error("로컬 D1 sqlite 파일을 찾지 못했습니다.");
    return "file:" + path.join(dir, file).split(path.sep).join("/");
}

async function main() {
    const { email, password, name } = parseArgs(process.argv.slice(2));

    const { PrismaClient } = require(
        path.join(process.cwd(), "src", "generated", "dev-client"),
    );
    const prisma = new PrismaClient({ datasourceUrl: localD1Url() });

    // register 라우트와 같은 cost 를 쓴다.
    const hashed = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: { password: hashed },
        });
        console.log(`기존 계정의 비밀번호를 재설정했습니다: ${email}`);
    } else {
        const user = await prisma.user.create({
            data: { name, email, password: hashed },
        });
        // register 라우트가 하는 초기화를 그대로 따라간다.
        await prisma.userSettings.create({ data: { userId: user.id } });
        await prisma.category.create({
            data: {
                name: "할 일",
                color: "#808080",
                creatorId: user.id,
                creatorName: user.name,
                participants: {},
            },
        });
        console.log(`계정을 만들었습니다: ${email}`);
    }

    console.log(`  이메일   ${email}`);
    console.log(`  비밀번호 ${password}`);

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
