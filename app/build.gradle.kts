import io.github.andreabrighi.gradle.gitsemver.conventionalcommit.ConventionalCommit
import com.github.gradle.node.npm.task.NpmTask
import com.github.gradle.node.task.NodeTask


plugins {
    id("org.danilopianini.git-sensitive-semantic-versioning") version "4.0.2"
    // Apply the Node.js plugin
    id("com.github.node-gradle.node") version "7.1.0"
}

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        // Add the plugin to the classpath
        classpath("io.github.andreabrighi:conventional-commit-strategy-for-git-sensitive-semantic-versioning-gradle-plugin:1.0.15")
    }
}

gitSemVer {
    maxVersionLength.set(20)
    commitNameBasedUpdateStrategy(ConventionalCommit::semanticVersionUpdate)
}

tasks.register<NpmTask>("runBackend") {
    dependsOn("prepareBackend")
    args.set(listOf("run", "start"))
}

tasks.register<NpmTask>("runDev"){
    dependsOn("prepareBackend")
    args.set(listOf("run", "dev"))
}

tasks.register<NpmTask>("prepareBackend") {
    dependsOn("npm_install")
    args.set(listOf("run", "build"))
}

tasks.register("printVersion") {
    doLast {
        println("Project version: ${project.version}")
    }
}