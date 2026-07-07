pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'DEPLOY_ENABLED', defaultValue: true, description: '构建成功后是否部署到服务器')
    string(name: 'DEPLOY_BRANCH', defaultValue: 'Develop', description: '允许自动部署的分支名')
    string(name: 'DEPLOY_HOST', defaultValue: '', description: '服务器 IP 或域名')
    string(name: 'DEPLOY_USER', defaultValue: 'deploy', description: '服务器 SSH 用户')
    string(name: 'DEPLOY_PORT', defaultValue: '22', description: '服务器 SSH 端口')
    string(name: 'DEPLOY_PATH', defaultValue: '/var/www/website', description: '服务器静态文件目录')
    string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'website-prod-ssh', description: 'Jenkins 中的 SSH 私钥凭据 ID')
  }

  environment {
    NPM_CONFIG_AUDIT = 'false'
    NPM_CONFIG_FUND = 'false'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
        sh 'test -f dist/index.html'
      }
      post {
        success {
          archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
      }
    }

    stage('Deploy') {
      when {
        expression {
          return params.DEPLOY_ENABLED &&
            env.CHANGE_ID == null &&
            (env.BRANCH_NAME == null || env.BRANCH_NAME == params.DEPLOY_BRANCH) &&
            (env.GIT_BRANCH == null || env.GIT_BRANCH == params.DEPLOY_BRANCH || env.GIT_BRANCH == "origin/${params.DEPLOY_BRANCH}")
        }
      }
      steps {
        script {
          if (!params.DEPLOY_HOST?.trim()) {
            error('DEPLOY_HOST 不能为空')
          }
          if (!params.DEPLOY_USER?.trim()) {
            error('DEPLOY_USER 不能为空')
          }
          if (!params.DEPLOY_PATH?.trim()) {
            error('DEPLOY_PATH 不能为空')
          }
        }
        sshagent(credentials: [params.SSH_CREDENTIALS_ID]) {
          sh 'chmod +x scripts/deploy-static.sh'
          sh 'scripts/deploy-static.sh'
        }
      }
    }
  }
  stage('Deploy') {
    steps {
        sh '''
            rsync -av --delete dist/ /var/www/teachteachbaby/
        '''
    }
  }

  post {
    success {
      echo 'Pipeline finished successfully.'
    }
    failure {
      echo 'Pipeline failed. Check the console log above.'
    }
  }
}
