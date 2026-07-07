# Jenkins + GitHub 前端自动部署

本文档用于把当前 Vite 前端项目接入 GitHub + Jenkins，实现 `npm run build` 后自动发布 `dist/` 到线上服务器。

## 流水线做什么

1. Jenkins 监听 GitHub push。
2. 拉取 `website` 仓库代码。
3. 执行 `npm ci` 安装依赖。
4. 执行 `npm run build` 生成 `dist/`。
5. 使用 Jenkins SSH 凭据，通过 `rsync` 把 `dist/` 同步到服务器静态目录。

## Jenkins 前置条件

Jenkins 节点需要安装：

- Git
- Node.js 和 npm
- rsync
- ssh

Jenkins 需要安装插件：

- Git plugin
- Pipeline
- SSH Agent
- GitHub plugin

建议 Node.js 版本使用 20 LTS 或更新的 LTS 版本。

## 服务器准备

假设用 `deploy` 用户发布到 `/var/www/website`。该目录建议只存放前端构建产物，因为部署脚本会用 `rsync --delete` 清理不再存在的旧文件。

```bash
sudo useradd -m deploy
sudo mkdir -p /var/www/website
sudo chown -R deploy:deploy /var/www/website
```

服务器也需要安装 `rsync`。

Nginx 可参考下面的 SPA 配置：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/website;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

修改后检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Jenkins 凭据

1. 在 Jenkins 进入 `Manage Jenkins` -> `Credentials`。
2. 新增 `SSH Username with private key`。
3. `ID` 填：`website-prod-ssh`。
4. `Username` 填服务器发布用户，例如 `deploy`。
5. Private Key 填能免密登录服务器的私钥。

对应的公钥需要写入服务器：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
vi ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Jenkins 任务配置

推荐新建 `Pipeline` 或 `Multibranch Pipeline` 任务。

普通 Pipeline：

1. `Definition` 选择 `Pipeline script from SCM`。
2. `SCM` 选择 `Git`。
3. `Repository URL` 填 GitHub 仓库地址，例如当前本地 remote 对应的 `git@github-new:anning28/website.git`，或你的实际 GitHub SSH 地址。
4. 配置 Jenkins 拉 GitHub 代码的凭据。
5. `Branch Specifier` 填 `*/Develop`。
6. `Script Path` 填 `Jenkinsfile`。

首次构建请使用 `Build with Parameters`，填写。如果 Jenkins 第一次还没有出现参数按钮，先运行一次让 Jenkins 读取 `Jenkinsfile`，失败后再回到任务页使用 `Build with Parameters`。

- `DEPLOY_HOST`：线上服务器 IP 或域名
- `DEPLOY_USER`：服务器 SSH 用户，默认 `deploy`
- `DEPLOY_PORT`：SSH 端口，默认 `22`
- `DEPLOY_PATH`：服务器静态目录，默认 `/var/www/website`
- `SSH_CREDENTIALS_ID`：Jenkins SSH 私钥凭据 ID，默认 `website-prod-ssh`
- `DEPLOY_BRANCH`：允许自动部署的分支，当前默认 `Develop`

如果线上分支是 `main` 或 `master`，把 `DEPLOY_BRANCH` 和 Jenkins 分支配置同步改成对应分支即可。

## GitHub Webhook

在 GitHub 仓库进入 `Settings` -> `Webhooks` -> `Add webhook`：

- `Payload URL`：`https://你的-jenkins-域名/github-webhook/`
- `Content type`：`application/json`
- `Which events would you like to trigger this webhook?`：选择 `Just the push event`

保存后，向 `DEPLOY_BRANCH` 推送代码即可触发 Jenkins 构建和部署。

## 手动验证

Jenkins 节点上可先验证构建：

```bash
npm ci
npm run build
```

如果要手动验证部署脚本：

```bash
DEPLOY_HOST=example.com \
DEPLOY_USER=deploy \
DEPLOY_PORT=22 \
DEPLOY_PATH=/var/www/website \
scripts/deploy-static.sh
```
