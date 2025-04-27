#!groovy 
pipeline {
    environment {
        SSH_GIT_FILE = "${env.WORKSPACE}/key"
        GIT_SSH_COMMAND = "ssh -i ${env.SSH_GIT_FILE}"
        KUBECONFIG_DIR = "${env.WORKSPACE}/tmp"
        KUBECONFIG = "${env.KUBECONFIG_DIR}/kube.yaml"
        DNS_NAME = 'dataspace4health.local'
        IT_HELM_REPO = 'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/helm-identity-and-trust'
        VC_ISSUER_REPO = 'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/keycloak-vc-issuer'
        WALTID_IDPKIT_REPO = 'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/waltid-idpkit'
        WALT_IDENTITY_REPO = 'git@ssh.dev.azure.com:v3/Dataspace4Health/DS4H/waltid-identity'
        HELM_IT_DIR = 'helm-identity-and-trust'
        VC_ISSUER_DIR = 'keycloak-vc-issuer'
        WALLETID_DIR = 'walletid'
        BRANCH_NAME = "${params.branch}"
        FALLBACK_BRANCH = 'main'
        REGISTRY = 'localhost:5000'
        REGISTRY_NAME = 'k3d-registry.localhost:5000'
        CLUSTER_FILE = "${env.WORKSPACE}/cluster.txt"
    }

    parameters {
        string(name: "branch", description: "branch name used for pulling repos", defaultValue: "jenkins")
    }

    agent {label 'worker'}

    stages {
        stage("Setup git and kubectl access") {
            steps {
                script {
                    ms.initSetup()
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

        stage("Create K3d Cluster and Test") {
            steps {
                script {
                    // deploy and test identity and trust
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