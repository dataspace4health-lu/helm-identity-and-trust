@Library(value="ds4h", changelog=false) _

pipeline {
    agent {label 'worker'}
    stages {
        stage('trigger idenity and trust pipeline') {
            steps {
                script {
                    triggers.triggerHelmPipeline('it')
                }
            }
        }
    }
}