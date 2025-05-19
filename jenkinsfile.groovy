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
                    utils.cloneRepo(env.IT_HELM_REPO, env.HELM_IT_DIR)
                    ms.setupVcIssuerRepo()
                    ms.setupWaltidRepo()
                }
            }
        }

        stage("Build Images") {
            parallel {
                stage("Build Walletid UI") {
                    steps {
                        script {
                            ms.buildWaltidUI()
                        }
                    }
                }
                stage("Build Walletid API") {
                    steps {
                        script {
                            ms.buildWaltidAPI()
                        }
                    }
                }
                stage("Build Keykloak VC Issuer Image") {
                    steps {
                        script {
                            ms.buildVCIssuerImage()
                        }
                    }
                }
            }
        }

        stage("Deploy And Test") {
            parallel {
                stage("Create K3d Cluster and Test") {
                    steps {
                        script {
                            ms.deployIT()
                        }
                    }
                }
                stage("Helm Charts Security Check") {
                    steps {
                        script {
                            utils.cloneRepo(env.IT_HELM_REPO, env.HELM_IT_DIR)
                            dir(env.HELM_IT_DIR) {
                                tests.trivyHelmChartCheck("./", "Identity and Trust")
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                ms.deleteImage(env.VC_ISSUER_IMG_FILE)
                ms.deleteImage(env.WALLETID_UI_IMG_FILE)
                ms.deleteImage(env.WALLETID_API_IMG_FILE)
                ms.postCleanup()
            }
        }
    }
}