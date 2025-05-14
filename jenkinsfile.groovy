@Library(value="ds4h", changelog=false) _

pipeline {
    environment {
        DNS_NAME = 'dataspace4health.local'
        IT_HELM_REPO = 'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/helm-identity-and-trust'
        BRANCH_NAME = "${params.branch}"
        REGISTRY = 'localhost:5000'
        REGISTRY_NAME = 'k3d-registry.localhost:5000'
    }

    parameters {
        string(name: "branch", description: "branch name used for pulling repos", defaultValue: "jenkins")
    }

    agent {label 'worker'}

    stages {
        stage("Setup git and kubectl access") {
            steps {
                script {
                    cleanWs()
                    utils.setEnv()
                    utils.initSetup()
                }
            }
        }

        stage("Build VC Issuer Image") {
            steps {
                script {
                    ms.buildVCIssuerImage()
                }
            }
        }

        stage("Build Wallet Identity UI and API Images") {
            steps {
                script {
                    ms.buildWaltidImages()
                }
            }
        }

        stage("Helm Chart Security Check") {
            steps {
                script {
                    utils.cloneRepo(env.IT_HELM_REPO, env.HELM_IT_DIR)
                    dir(env.HELM_FC_DIR) {
                        tests.trivyHelmChartCheck("./", "Identity and Trust")
                    }
                }
            }
        }

        stage("Create K3d Cluster and Test") {
            steps {
                script {
                    ms.deployIT()
                }
            }
        }

        stage("Clean Up") {
            steps {
                script {
                    // delete Idenity and trust images
                    sh "docker rmi ${REGISTRY}/${env.vc_issuer_image_name}:${env.vc_issuer_image_tag}"
                    sh "docker rmi ${env.vc_issuer_image_name}:${env.vc_issuer_image_tag}"
                    sh "docker rmi ${REGISTRY}/${env.walletid_ui_image_name}:${env.walletid_ui_image_tag}"
                    sh "docker rmi ${env.walletid_ui_image_name}:${env.walletid_ui_image_tag}"
                    sh "docker rmi ${REGISTRY}/${env.walletid_api_image_name}:${env.walletid_api_image_tag}"
                    sh "docker rmi ${env.walletid_api_image_name}:${env.walletid_api_image_tag}"
                }
            }
        }
    }

    post {
        always {
            script {
                ms.postCleanup()
            }
        }
    }
}