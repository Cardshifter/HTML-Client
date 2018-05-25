#!/usr/bin/env groovy

@Library('ZomisJenkins')
import net.zomis.jenkins.Duga

pipeline {
    agent any

    stages {
        stage('Prepare') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh 'npm install && npm run build'
            }
        }

        stage('Docker Image') {
            when {
                branch 'master'
            }
            steps {
                script {
                    sh 'docker ps -q --filter name="cardshifter_client" | xargs -r docker stop'
                    sh 'docker run -d --rm --name cardshifter_client -v $(pwd)/dist:/usr/share/nginx/html:ro -p 22739:80 nginx'
                }
            }
        }

/*
                withSonarQubeEnv('My SonarQube Server') {
                    // requires SonarQube Scanner for Maven 3.2+
                    sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.2:sonar'
                }
*/
    }

    post {
        success {
            zpost(0)
        }
        unstable {
            zpost(1)
        }
        failure {
            zpost(2)
        }
    }
}
