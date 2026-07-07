pipeline {

    agent any


    /*
     * Git Push 自动触发
     * 配合 GitHub/Gitee Webhook
     */
    triggers {
        githubPush()
    }


    options {

        // 日志显示时间
        timestamps()

        // 禁止同时部署多个版本
        disableConcurrentBuilds()

        // 保留最近20次构建记录
        buildDiscarder(
            logRotator(
                numToKeepStr: '20'
            )
        )

        // 单次构建最长30分钟
        timeout(
            time: 30,
            unit: 'MINUTES'
        )

        // 手动控制checkout
        skipDefaultCheckout(true)
    }


    parameters {

        booleanParam(
            name: 'DEPLOY_ENABLED',
            defaultValue: true,
            description: '构建成功后自动部署'
        )


        string(
            name: 'DEPLOY_BRANCH',
            defaultValue: 'master',
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


        /*
         * 拉取代码
         */
        stage('Checkout') {

            steps {

                checkout scm


                sh '''
                    echo "========== Git Info =========="

                    git branch --show-current

                    git log -1 --pretty=format:"Commit: %h %s"

                    echo ""
                '''
            }
        }



        /*
         * 安装依赖
         */
        stage('Install') {

            steps {

                sh '''
                    echo "========== Node =========="

                    node -v

                    npm -v


                    echo "========== Install =========="

                    npm ci
                '''
            }
        }




        /*
         * 前端构建
         */
        stage('Build') {


            steps {


                sh '''

                    echo "========== Build =========="


                    npm run build


                    echo "========== Check Build =========="


                    test -f dist/index.html


                    ls -lh dist/index.html

                '''
            }


            post {


                success {


                    archiveArtifacts(

                        artifacts: 'dist/**',

                        fingerprint: true

                    )
                }
            }
        }





        /*
         * 部署
         */
        stage('Deploy') {


            when {


                expression {


                    return (

                        params.DEPLOY_ENABLED

                        &&

                        (
                            env.CHANGE_ID == null
                        )

                        &&

                        (
                            env.BRANCH_NAME == null

                            ||

                            env.BRANCH_NAME == params.DEPLOY_BRANCH

                            ||

                            env.GIT_BRANCH == params.DEPLOY_BRANCH

                            ||

                            env.GIT_BRANCH == "origin/${params.DEPLOY_BRANCH}"

                        )
                    )
                }
            }



            steps {


                sh '''

                    echo "========== Deploy =========="


                    chmod +x scripts/deploy-static.sh


                '''



                withEnv([

                    "DEPLOY_PATH=${params.DEPLOY_PATH}"

                ]) {


                    sh '''

                        scripts/deploy-static.sh


                    '''
                }
            }
        }
    }





    post {


        success {


            echo """

            =========================

            ✅ Jenkins Build Success

            Branch:
            ${env.GIT_BRANCH}

            Build:
            ${env.BUILD_NUMBER}

            =========================

            """
        }




        failure {


            echo """

            =========================

            ❌ Jenkins Build Failed


            Please check console output


            =========================

            """
        }


        always {

            echo "Jenkins finished."

        }
    }
}