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

tasks.register<Delete>("cleanBuild"){
    group = "build"
    description = "Delete the dist directory"
    doFirst {
        delete("dist")
    }
}

tasks.register<NpmTask>("npmCiRoot") {
    group = "npm"
    description = "Install npm dependencies in the root project"
    workingDir = file("..")
    args.set(listOf("ci"))
}

tasks.register<NpmTask>("npmCiApp") {
    group = "npm"
    description = "Install npm dependencies in the app directory"
    args.set(listOf("ci"))
}

tasks.register("npmCiAll") {
    group = "npm"
    description = "Install npm dependencies in the root project and in the app directory"
    dependsOn("npmCiRoot", "npmCiApp")
}

tasks.register<NpmTask>("prepareBackend") {
    dependsOn("npmCiAll")
    args.set(listOf("run", "build"))
}

tasks.register<NpmTask>("runDev"){
    dependsOn("prepareBackend")
    args.set(listOf("run", "dev"))
}

tasks.register<NpmTask>("test") {
    dependsOn("prepareBackend")
    args.set(listOf("run", "test"))
}

tasks.register("printVersion") {
    doLast {
        println("Project version: ${project.version}")
    }
}

tasks.register("preRunAll") {
    group = "application"
    description = "Clean, install dependencies and run tests"
    dependsOn("cleanBuild", "npmCiAll", "test")
}

tasks.register("allInOne") {
    group = "application"
    description = "Run build and tests, then start the application"
    dependsOn("preRunAll")
    finalizedBy("runDev")
}