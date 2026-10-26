import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-dev/**",
      "out/**",
      "out-desktop/**",
      ".open-next/**",
      "build/**",
      "next-env.d.ts",
      // 생성·빌드 산출물 (모두 gitignore 대상)
      "src/generated/**",    // prisma generate
      "src-tauri/target/**", // cargo build
      ".wrangler/**",        // wrangler 로컬 상태·임시 번들
    ],
  },
];

export default eslintConfig;
