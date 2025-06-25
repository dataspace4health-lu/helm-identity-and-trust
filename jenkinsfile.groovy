@Library(value="ds4h", changelog=false) _

pipeline {
    environment {
        DNS_NAME = 'dataspace4health.local'
        BRANCH_NAME = "${params.branch}"
        REGISTRY = 'localhost:5000'
        REGISTRY_NAME = 'k3d-registry.localhost:5000'
    }

    parameters {
        string(name: "branch", description: "branch name used for pulling repos", defaultValue: "jenkins")
    }

    agent {label 'worker'}

    stages {
        stage("Initialization") {
            steps {
                script {
                    cleanWs()
                    utils.setEnv()
                    utils.initSetup()
                }
            }
        }

        stage("Clone Repositories") {
            parallel {
                stage("Clone Helm Identity And Trust") {
                    steps {
                        script {
                            utils.cloneRepo(env.IT_HELM_REPO, env.HELM_IT_DIR)
                            dir(env.HELM_IT_DIR) {
                                tests.trivyHelmChartCheck("./", "Identity and Trust")
                            }
                        }
                    }
                }
                stage("Setup idpkit, keycloak-vc-issuer and ssikit") {
                    steps {
                        script {
                            ms.setupIdpKitRepo()
                            ms.setupVcIssuerRepo()
                            ms.setupSSIKitRepo()
                        }
                    }
                }
                stage("Setup Walt identity Repo") {
                    steps {
                        script {
                            ms.setupWaltidRepo(false)
                        }
                    }
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
                stage("Build Idpkit Image") {
                    steps {
                        script {
                            ms.buildIdpKitImage()
                        }
                    }
                }
                stage("Build SSIkit Image") {
                    steps {
                        script {
                            ms.buildSsikitImage()
                        }
                    }
                }
                stage("Build Keycloak VC Issuer Image") {
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
                stage("Deploy Helm Identit and Trust") {
                    steps {
                        script {
                            ms.deployIT()
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                ms.deleteImage(env.WALLETID_UI_IMG_FILE)
                ms.deleteImage(env.WALLETID_API_IMG_FILE)
                ms.deleteImage(env.IDPKIT_IMG_FILE)
                ms.deleteImage(env.SSIKIT_IMG_FILE)
                ms.deleteImage(env.VC_ISSUER_IMG_FILE)
                ms.postCleanup()
            }
        }
    }
}