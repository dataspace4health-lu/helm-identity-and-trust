@Library(value="ds4h", changelog=false) _

properties([
    parameters([
        string(name: 'NODE_NAME', description: 'Agent to run on', defaultValue: 'any'),
        string(name: 'BRANCH', description: 'Branch to check out', defaultValue: ''),
        string(name: "PUBLISH_HELM", description: "Registry to use for publishing", defaultValue: '')
    ])
])

helmPipeline(
    NODE_NAME: params.NODE_NAME,
    BRANCH: params.BRANCH,
    IMG_PAHTS: """select(.kind == "Deployment" and .metadata.labels."app.kubernetes.io/name" == "idp-api") | .spec.template.spec.containers[0].image,
                select(.kind == "Deployment" and .metadata.labels."app.kubernetes.io/name" == "issuer-api") | .spec.template.spec.containers[0].image,
                select(.kind == "Deployment" and .metadata.labels."app.kubernetes.io/name" == "wallet-api") | .spec.template.spec.containers[0].image,
                select(.kind == "Deployment" and .metadata.labels."app.kubernetes.io/name" == "wallet-ui") | .spec.template.spec.containers[0].image""",
    IMG_JOBS: """DS4H/test-antonio-docker/waltid-idpkit,
                DS4H/test-antonio-docker/waltid-ssikit,
                DS4H/test-antonio-docker/waltid-identity-wallet-api,
                DS4H/test-antonio-docker/walitd-identity-wallet-ui""",
    PUBLISH_HELM: params.PUBLISH_HELM
)