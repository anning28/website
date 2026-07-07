pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    parameters {
        booleanParam(
            name: 'DEPLOY_ENABLED',
            defaultValue: true,
            description: '构建成功后自动部署'
        )

        string(
            name: 'DEPLOY_BRANCH',
            defaultValue: 'Develop',
            description: '允许自动部署的分支'
        )

        string(
            name: 'DEPLOY_PATH',
            defaultValue: '/var/www/teachteachbaby',
            description: '网站部署目录'
        )
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
                sh '''
                    node -v
                    npm -v
                    npm ci
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    npm run build
                    test -f dist/index.html
                '''
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
                        (env.CHANGE_ID == null) &&
                        (
                            env.BRANCH_NAME == null ||
                            env.BRANCH_NAME == params.DEPLOY_BRANCH ||
                            env.GIT_BRANCH == params.DEPLOY_BRANCH ||
                            env.GIT_BRANCH == "origin/${params.DEPLOY_BRANCH}"
                        )
                }
            }

            steps {

                sh 'chmod +x scripts/deploy-static.sh'

                withEnv([
                    "DEPLOY_PATH=${params.DEPLOY_PATH}"
                ]) {

                    sh 'scripts/deploy-static.sh'

                }
            }
        }
    }

    post {

        success {
            echo "✅ Build Success"
        }

        failure {
            echo "❌ Build Failed"
        }
    }
}