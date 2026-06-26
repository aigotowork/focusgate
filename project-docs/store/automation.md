# Chrome Web Store 自动发布流程

Last reviewed: 2026-06-26

目标：后续版本可以从本地或 GitHub Actions 上传 Chrome Web Store zip、提交审核、查询状态。首次上架仍需要先在 Developer Dashboard 手动完成 Store listing、Privacy、Distribution 和 trusted tester 配置。

官方参考：

- CWS API 使用说明：<https://developer.chrome.com/docs/webstore/using-api>
- CWS API 服务账号：<https://developer.chrome.com/docs/webstore/service-accounts>
- CWS API v2 discovery：`https://chromewebstore.googleapis.com/$discovery/rest?version=v2`
- Dashboard 发布流程：<https://developer.chrome.com/docs/webstore/publish>

## 当前已搭建内容

| 文件 / 命令 | 作用 |
| --- | --- |
| `scripts/cws-api.mjs` | 直接调用 Chrome Web Store API v2。 |
| `.env.example` | 本地环境变量模板，不包含密钥。 |
| `.github/workflows/chrome-web-store.yml` | GitHub Actions 手动触发上传 / 提交 / 状态查询。 |
| `npm run store:cws:upload` | 上传当前 `artifacts/chrome-web-store/focusgate-<version>.zip`。 |
| `npm run store:cws:submit` | 提交最近上传的包进入审核。 |
| `npm run store:cws:release` | 上传并提交审核。 |
| `npm run store:cws:status` | 查询当前 item 状态。 |
| `npm run store:cws:set-percentage` | 调整已发布版本的发布比例；CWS 只对满足条件的 item 开放。 |

## 你需要提供的信息

| 变量 | 是否敏感 | 用途 | 获取方式 |
| --- | --- | --- | --- |
| `CWS_EXTENSION_ID` | 否 | Chrome Web Store item ID | 已知：`hgjbamghlljcjckbcibjgknaidedaibi`。 |
| `CWS_PUBLISHER_ID` | 半公开 | API v2 item path 必需 | Chrome Web Store Developer Dashboard -> `Publisher` / account settings。它通常不是 `aigotowork` 这个显示名。 |
| `CWS_SERVICE_ACCOUNT_JSON` | 是 | 推荐的自动发布凭据 | Google Cloud 创建服务账号并给 CWS publisher 授权后，下载 JSON key。 |
| Trusted tester emails | 是 / 个人信息 | 首轮测试发布可见范围 | 你决定哪些邮箱能安装测试版本，在 Dashboard Distribution 中添加。 |

不要把 `CWS_SERVICE_ACCOUNT_JSON`、service account key 文件、OAuth refresh token 发到公开 issue、公开文档或 git commit。

## 推荐方式：服务账号

### 1. 创建或选择 Google Cloud project

1. 打开 <https://console.cloud.google.com/>
2. 创建一个项目，例如 `focusgate-cws-publish`。
3. 在该项目中启用 `Chrome Web Store API`。

### 2. 创建服务账号

1. Google Cloud Console -> `IAM & Admin` -> `Service Accounts`。
2. 创建服务账号，例如 `focusgate-cws-publisher`。
3. 复制服务账号邮箱，格式类似：

```text
focusgate-cws-publisher@<project-id>.iam.gserviceaccount.com
```

### 3. 在 Chrome Web Store publisher 中授权服务账号

1. 打开 Chrome Web Store Developer Dashboard。
2. 进入 publisher / account settings。
3. 找到 API access 或 service account 相关入口。
4. 添加上一步的服务账号邮箱，并授予可以上传和发布该 item 的权限。

需要你确认并提供：

```text
CWS_PUBLISHER_ID=<Dashboard 显示的 publisher ID>
```

### 4. 生成服务账号 JSON key

1. Google Cloud Console -> 服务账号详情 -> `Keys`。
2. `Add key` -> `Create new key` -> `JSON`。
3. 下载 JSON。

本地使用方式：

```bash
export CWS_EXTENSION_ID=hgjbamghlljcjckbcibjgknaidedaibi
export CWS_PUBLISHER_ID=<你的 publisher ID>
export CWS_SERVICE_ACCOUNT_FILE=/absolute/path/to/service-account.json
npm run store:cws:status
```

GitHub Actions 使用方式：

1. GitHub repo -> `Settings` -> `Secrets and variables` -> `Actions`。
2. 新增 secrets：

```text
CWS_EXTENSION_ID=hgjbamghlljcjckbcibjgknaidedaibi
CWS_PUBLISHER_ID=<你的 publisher ID>
CWS_SERVICE_ACCOUNT_JSON=<服务账号 JSON 的完整内容，压成一行也可以>
```

## 备用方式：OAuth refresh token

如果服务账号暂时无法配置，也可以用 OAuth client 和 refresh token。这个方式更适合个人本地发布，不如服务账号适合 CI。

需要的变量：

```text
CWS_CLIENT_ID=
CWS_CLIENT_SECRET=
CWS_REFRESH_TOKEN=
CWS_PUBLISHER_ID=
CWS_EXTENSION_ID=hgjbamghlljcjckbcibjgknaidedaibi
```

获取方式：

1. Google Cloud Console -> 启用 `Chrome Web Store API`。
2. `APIs & Services` -> `Credentials` -> 创建 OAuth Client。
3. 应用类型选 `Desktop app`。
4. 生成 `client_id` 和 `client_secret`。
5. 用一个 OAuth helper 或你自己的 OAuth flow 获取 scope 为 `https://www.googleapis.com/auth/chromewebstore` 的 refresh token。

本仓库脚本会读取这些变量并换取 access token；不会把 token 写入文件。

## 本地发布命令

先打包：

```bash
npm run package:store
```

查询状态：

```bash
npm run store:cws:status
```

只上传 zip，不提交审核：

```bash
npm run store:cws:upload
```

提交最近上传的包进入审核：

```bash
npm run store:cws:submit -- --block-on-warnings=true
```

上传并提交审核：

```bash
npm run store:cws:release -- --block-on-warnings=true
```

如果希望审核通过后先 staged，不自动对用户发布：

```bash
npm run store:cws:submit -- --publish-type=STAGED_PUBLISH --block-on-warnings=true
```

默认 `publishType` 是 `DEFAULT_PUBLISH`。API v2 支持的值是：

- `DEFAULT_PUBLISH`：审核通过后按 Dashboard 当前发布设置发布。
- `STAGED_PUBLISH`：审核通过后暂存，之后由开发者再发布。

注意：API v2 没有 `TRUSTED_TESTERS` 这个 `publishType`。首轮测试者发布应在 Dashboard 的 Distribution 可见性里配置为 private / trusted testers，然后用 `DEFAULT_PUBLISH` 提交审核。

## GitHub Actions 发布

工作流：`.github/workflows/chrome-web-store.yml`

触发方式：

1. GitHub repo -> `Actions`。
2. 选择 `Chrome Web Store` workflow。
3. 点 `Run workflow`。
4. 选择 action：
   - `status`：只查状态。
   - `upload`：跑测试、打包、上传 zip。
   - `submit`：提交最近上传的包进入审核。
   - `release`：跑测试、打包、上传并提交审核。
5. `publish_type` 一般保持 `DEFAULT_PUBLISH`。如果想先审核通过但不立即发布，选 `STAGED_PUBLISH`。

## 首次发布流程建议

1. 开启 GitHub Pages `/docs`，确认三个公开 URL 能打开：
   - `https://aigotowork.github.io/focusgate/`
   - `https://aigotowork.github.io/focusgate/support/`
   - `https://aigotowork.github.io/focusgate/privacy/`
2. 按 `project-docs/store/dashboard-fields.md` 填 Dashboard。
3. 在 Distribution 中设置 `Private / Trusted testers`，添加测试者邮箱。
4. 本地跑：

```bash
npm run store:assets
npm run store:screenshots
npm test
npm run test:e2e
npm run package:store
```

5. Dashboard 手动上传 zip，或者配置好服务账号后运行：

```bash
npm run store:cws:release -- --block-on-warnings=true
```

6. 审核通过后用测试邮箱安装验证。
7. 测试通过后在 Dashboard 切到 Public，必要时重新提交审核。

## 常见错误

`CWS_PUBLISHER_ID is required`

说明还没有提供 publisher ID。它不是公开发布者名称 `aigotowork`，需要在 CWS Dashboard 里找。

`No Chrome Web Store API authentication was found`

说明没有设置服务账号、access token 或 OAuth refresh token。优先设置 `CWS_SERVICE_ACCOUNT_JSON` 或 `CWS_SERVICE_ACCOUNT_FILE`。

`403` / `permission denied`

通常是服务账号没有被添加到 Chrome Web Store publisher，或者没有权限访问该 item。

`400` / validation warnings

看 API 返回的 warning/error。若使用 `--block-on-warnings=true`，有警告时会失败，这是推荐行为，避免带着审核风险继续提交。
