<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 概要

Cookieベース認証 + CSRF(ダブルサブミット)方式に対応しています。以下の環境変数を適切に設定してください。

### 必須・推奨環境変数

- `FRONTEND_URL` フロントエンドのオリジン（例: `http://localhost:3001`）
- `JWT_SECRET` JWTの署名鍵
- `COOKIE_SECURE` `true|false` 本番は `true`（HTTPS必須）
- `COOKIE_SAMESITE` `lax|none`
  - 同一サイト: `lax` 推奨
  - クロスサイト: `none`（この場合は `COOKIE_SECURE=true` が必須）
- `COOKIE_DOMAIN` Cookieのドメイン
  - 同一ホストのみで良い場合は未設定（省略）を推奨
  - サブドメイン跨ぎが必要な場合は例: `.example.com`

### トークン期限設定（オプション）

開発・テスト時にトークン期限を短縮できます（ミリ秒単位）：

- `ACCESS_TOKEN_MAX_AGE_MS` アクセストークンの有効期限（デフォルト: 900000ms = 15分）
- `REFRESH_TOKEN_MAX_AGE_MS` リフレッシュトークンの有効期限（デフォルト: 604800000ms = 7日）
- `CSRF_TOKEN_MAX_AGE_MS` CSRFトークンの有効期限（デフォルト: 86400000ms = 24時間）

### ローカル開発例

```bash
FRONTEND_URL=http://localhost:3001
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
# COOKIE_DOMAIN は未設定（省略）

# テスト用: トークン期限を短縮（オプション）
# ACCESS_TOKEN_MAX_AGE_MS=120000      # 2分
# REFRESH_TOKEN_MAX_AGE_MS=300000     # 5分
# CSRF_TOKEN_MAX_AGE_MS=600000        # 10分
```

### 本番例（サブドメイン運用）

```bash
FRONTEND_URL=https://app.example.com
COOKIE_SECURE=true
COOKIE_SAMESITE=none
COOKIE_DOMAIN=.example.com
```

注意: `SameSite=none` を採用する場合は必ず `Secure` を有効にしてください（ブラウザ要件）。

## セットアップ

環境変数（.env または .env.local）を設定してから、以下を実行してください：

```bash
npm install
```

## 実行

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## テスト

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## デプロイ

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
