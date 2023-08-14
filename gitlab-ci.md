# gitlab ci/cd

## ci
Each change submitted to an application, even to development branches, is built and tested automatically and continuously. These tests ensure the changes pass all tests, guidelines, and code compliance standards you established for your application.

## Continuous Delivery

is a step beyond Continuous Integration. Not only is your application built and tested each time a code change is pushed to the codebase, the application is also deployed continuously. However, with continuous delivery, you trigger the deployments manually.

## Continuous Deployment
Continuous Deployment is another step beyond Continuous Integration, similar to Continuous Delivery. The difference is that instead of deploying your application manually, you set it to be deployed automatically. 

## GitLab CI/CD workflow
![Alt](https://docs.gitlab.com/ee/ci/introduction/img/gitlab_workflow_example_11_9.png)


## Migrating from Jenkins
[Migrating from Jenkins](https://docs.gitlab.com/ee/ci/migration/jenkins.html)

## pipelines
Pipelines comprise:

Jobs, which define what to do. For example, jobs that compile or test code.
Stages, which define when to run the jobs. For example, stages that run tests after stages that compile the code.

![Alt](https://docs.gitlab.com/ee/ci/pipelines/img/manual_pipeline_v14_2.png)

A typical pipeline might consist of four stages, executed in the following order:

* A build stage, with a job called compile.
* A test stage, with two jobs called test1 and test2.
* A staging stage, with a job called deploy-to-stage.
* A production stage, with a job called deploy-to-prod.

Pipelines can be configured in many different ways:

* Basic pipelines run everything in each stage concurrently, followed by the next stage.
* Directed Acyclic Graph Pipeline (DAG 有向无环图) pipelines are based on relationships between jobs and can run more quickly than basic pipelines.
* Merge request pipelines run for merge requests only (rather than for every commit).
* Merged results pipelines are merge request pipelines that act as though the changes from the source branch have already been merged into the target branch.
* Merge trains use merged results pipelines to queue merges one after the other.
* Parent-child pipelines break down complex pipelines into one parent pipeline that can trigger multiple child sub-pipelines, which all run in the same project and with the same SHA. This pipeline architecture is commonly used for mono-repos.
* Multi-project pipelines combine pipelines for different projects together.

### Ref specs for runners

Pipeline type	Refspecs
pipeline for branches	+<sha>:refs/pipelines/<id> and +refs/heads/<name>:refs/remotes/origin/<name>
pipeline for tags	+<sha>:refs/pipelines/<id> and +refs/tags/<name>:refs/tags/<name>
merge request pipeline	+<sha>:refs/pipelines/<id>

### Prefill variables in manual pipelines

You can use the description and value keywords to define pipeline-level (global) variables that are prefilled when running a pipeline manually. Use the description to explain information such as what the variable is used for, and what the acceptable values are.

```
variables:
  DEPLOY_CREDENTIALS:
    description: "The deployment credentials."
  DEPLOY_ENVIRONMENT:
    description: "Select the deployment target. Valid options are: 'canary', 'staging', 'production', or a stable branch of your choice."
    value: "canary" 
```

```
variables:
  DEPLOY_ENVIRONMENT:
    value: "staging"
    options:
      - "production"
      - "staging"
      - "canary"
    description: "The deployment target. Set to 'staging' by default."
```

### Run a pipeline by using a URL query string
The following parameters are supported:

ref: specify the branch to populate the Run for field with.
var: specify a Variable variable.
file_var: specify a File variable.
For each var or file_var, a key and value are required.

### Pipeline security on protected branches

Variables marked as protected are accessible only to jobs that run on protected branches, preventing untrusted users getting unintended access to sensitive information like deployment credentials and tokens.

Runners marked as protected can run jobs only on protected branches, preventing untrusted code from executing on the protected runner and preserving deployment keys and other credentials from being unintentionally accessed. To ensure that jobs intended to be executed on protected runners do not use regular runners, they must be tagged accordingly.

### How pipeline duration is calculated
Total running time for a given pipeline excludes retries and pending (queued) time.

## Jobs

Pipeline configuration begins with jobs. Jobs are the most fundamental element of a .gitlab-ci.yml file.

```
job1:
  script: "execute-script-for-job1"

job2:
  script: "execute-script-for-job2"
```

### job status
* failed
* warning
* pending
* running
* manual
* scheduled
* canceled
* success
* skipped
* created

### Group jobs
![Alt](https://docs.gitlab.com/ee/ci/jobs/img/pipeline_grouped_jobs_v14_2.png)

To create a group of jobs, in the CI/CD pipeline configuration file, separate each job name with a number and one of the following:

* A slash (/), for example, slash-test 1/3, slash-test 2/3, slash-test 3/3.
* A colon (:), for example, colon-test 1:3, colon-test 2:3, colon-test 3:3.
* A space, for example space-test 0 3, space-test 1 3, space-test 2 3.

```
build ruby 1/3:
  stage: build
  script:
    - echo "ruby1"

build ruby 2/3:
  stage: build
  script:
    - echo "ruby2"

build ruby 3/3:
  stage: build
  script:
    - echo "ruby3"
```

### Control the inheritance of default keywords and global variables
```
default:
  image: 'ruby:2.4'
  before_script:
    - echo Hello World

variables:
  DOMAIN: example.com
  WEBHOOK_URL: https://my-webhook.example.com

rubocop:
  inherit:
    default: false
    variables: false
  script: bundle exec rubocop

rspec:
  inherit:
    default: [image]
    variables: [WEBHOOK_URL]
  script: bundle exec rspec

capybara:
  inherit:
    variables: false
  script: bundle exec capybara

karma:
  inherit:
    default: true
    variables: [DOMAIN]
  script: karma
```
### Job logs
#### Custom collapsible sections
* Section start marker: \e[0Ksection_start:UNIX_TIMESTAMP:SECTION_NAME\r\e[0K + TEXT_OF_SECTION_HEADER
* Section end marker: \e[0Ksection_end:UNIX_TIMESTAMP:SECTION_NAME\r\e[0K
* Add [collapsed=true] after the section name and before the \r.
* 
```
job1:
  script:
    - echo -e "\e[0Ksection_start:`date +%s`:my_first_section\r\e[0KHeader of the 1st collapsible section"
    - echo 'this line should be hidden when collapsed'
    - echo -e "\e[0Ksection_end:`date +%s`:my_first_section\r\e[0K"
```
### Deployment jobs
Deployment jobs are a specific kind of CI job in that they deploy code to environments. A deployment job is any job that uses the environment keyword and the start environment action. Deployment jobs do not need to be in the deploy stage. The following deploy me job is an example of a deployment job. action: start is the default behavior and is defined for the sake of the example, but you can omit it:
```
deploy me:
  script:
    - deploy-to-cats.sh
  environment:
    name: production
    url: https://cats.example.com
    action: start
```

## Choose when to run jobs
You can configure jobs to run depending on factors like the status of variables, or the pipeline type.
### rules.if
```
job:
  script: echo "Hello, Rules!"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: manual
      allow_failure: true
    - if: $CI_PIPELINE_SOURCE == "schedule"
```
```
job:
  script: echo "Hello, Rules!"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: never
    - if: $CI_PIPELINE_SOURCE == "schedule"
      when: never
    - when: on_success
```
If the pipeline is for a merge request, the job is not added to the pipeline.
If the pipeline is a scheduled pipeline, the job is not added to the pipeline.
In all other cases, the job is added to the pipeline, with when: on_success.

#### Run jobs for scheduled pipelines

```
job:on-schedule:
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
  script:
    - make world

job:
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
  script:
    - make build
```
### Reuse rules in different jobs
Use !reference tags to reuse rules in different jobs.

```
.default_rules:
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
      when: never
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

job1:
  rules:
    - !reference [.default_rules, rules]
  script:
    - echo "This job runs for the default branch, but not schedules."

job2:
  rules:
    - !reference [.default_rules, rules]
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  script:
    - echo "This job runs for the default branch, but not schedules."
    - echo "It also runs for merge requests."
```
### rules.only/rules.except
#### only:refs / except:refs
#### only: variables / except: variables
#### only:changes / except:changes  
```
job:
  only:
    - tags
    - triggers
    - schedules
    - branches@gitlab-org/gitlab
  except:
    - main@gitlab-org/gitlab
    - /^release/.*$/@gitlab-org/gitlab
```
### Create a job that must be run manually
You can require that a job doesn’t run unless a user starts it. This is called a manual job. You might want to use a manual job for something like deploying to production.

```
deploy_prod:
  stage: deploy
  script:
    - echo "Deploy to production server"
  environment:
    name: production
    url: https://example.com
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

#### optional manual jobs:
allow_failure is true, which is the default setting for jobs that have when: manual and no rules, or when: manual defined outside of rules.

#### blocking manual jobs:
allow_failure is false, which is the default setting for jobs that have when: manual defined inside rules.

### Parallelize large jobs
o split a large job into multiple smaller jobs that run in parallel, use the parallel keyword in your .gitlab-ci.yml file.

Different languages and test suites have different methods to enable parallelization. For example, use Semaphore Test Boosters and RSpec to run Ruby tests in parallel:
```
test:
  parallel: 3
  script:
    - bundle
    - bundle exec rspec_booster --job $CI_NODE_INDEX/$CI_NODE_TOTAL
```
## CI/CD job token
When a pipeline job is about to run, GitLab generates a unique token and injects it as the CI_JOB_TOKEN predefined variable.

## 变量
### 预定义变量
[常用变量](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html)
[变量可以用的情况](https://docs.gitlab.com/ee/ci/jobs/job_control.html#use-predefined-cicd-variables-to-run-jobs-only-in-specific-pipeline-types)

#### $CI_PIPELINE_SOURCE
Value	Description
api	For pipelines triggered by the pipelines API.
chat	For pipelines created by using a GitLab ChatOps command.
external	When you use CI services other than GitLab.
external_pull_request_event	When an external pull request on GitHub is created or updated. See Pipelines for external pull requests.
merge_request_event	For pipelines created when a merge request is created or updated. Required to enable merge request pipelines, merged results pipelines, and merge trains.
parent_pipeline	For pipelines triggered by a parent/child pipeline with rules. Use this pipeline source in the child pipeline configuration so that it can be triggered by the parent pipeline.
pipeline	For multi-project pipelines created by using the API with CI_JOB_TOKEN, or the trigger keyword.
push	For pipelines triggered by a git push event, including for branches and tags.
schedule	For scheduled pipelines.
trigger	For pipelines created by using a trigger token.
web	For pipelines created by using Run pipeline button in the GitLab UI, from the project’s CI/CD > Pipelines section.
webide	For pipelines created by using the WebIDE.

#### $CI_COMMIT_TAG
 If changes are pushed for a tag.
#### $CI_COMMIT_BRANCH
If changes are pushed to any branch.
#### $CI_DEFAULT_BRANCH
#### $xxx 
自定义变量xxx

### 定义变量
To create a CI/CD variable in the .gitlab-ci.yml file, define the variable and value with the variables keyword.

```
variables:
  GLOBAL_VAR: "A global variable"

job1:
  variables:
    JOB_VAR: "A job variable"
  script:
    - echo "Variables are '$GLOBAL_VAR' and '$JOB_VAR'"
```
### 屏蔽变量
```
variables:
  GLOBAL_VAR: "A global variable"

job1:
  variables: {}
  script:
    - echo This job does not need any variables
```
### 掩盖敏感变量
[掩盖敏感变量](https://docs.gitlab.com/ee/ci/variables/#mask-a-cicd-variable)

### 数组变量
You cannot create a CI/CD variable that is an array of values, but you can use shell scripting techniques for similar behavior.
For example, you can store multiple values separated by a space in a variable, then loop through the values with a script:
```
job1:
  variables:
    FOLDERS: src test docs
  script:
    - |
      for FOLDER in $FOLDERS
        do
          echo "The path is root/${FOLDER}"
        done
```

### job之间变量传递
```
build-job:
  stage: build
  script:
    - echo "BUILD_VARIABLE=value_from_build_job" >> build.env
  artifacts:
    reports:
      dotenv: build.env

test-job:
  stage: test
  script:
    - echo "$BUILD_VARIABLE"  # Output is: 'value_from_build_job'
```
#### 控制某个job不接收dotenv
* Pass an empty dependencies or needs array.
* Pass needs:artifacts as false.
* Set needs to only list jobs that do not have a dotenv artifact.

### 变量引用
```
ob:
  variables:
    FLAGS: '-al'
    LS_CMD: 'ls "$FLAGS"'
  script:
    - 'eval "$LS_CMD"'  # Executes 'ls -al'
```
```
job:
  variables:
    FLAGS: '-al'
    LS_CMD: 'ls "$FLAGS" $$TMP_DIR'
  script:
    - 'eval "$LS_CMD"'  # Executes 'ls -al $TMP_DIR'
```

## Variables in rules:changes
You can use CI/CD variables in rules:changes expressions to determine when to add jobs to a pipeline:
```
docker build:
  variables:
    DOCKERFILES_DIR: 'path/to/files'
  script: docker build -t my-image:$CI_COMMIT_REF_SLUG .
  rules:
    - changes:
        - $DOCKERFILES_DIR/*
```
## 正则

Only the tag or branch name can be matched by a regular expression. The repository path, if given, is always matched literally.

```
job:
  # use regexp
  only:
    - /^issue-.*$/i
  # use special keyword
  except:
    - branches
```

### 正则匹配
do regex pattern matching on variable values with the =~ and !~ operators


## 表达式

Use variable expressions to control which jobs are created in a pipeline after changes are pushed to GitLab. You can use variable expressions with:
* rules:if.
* only:variables and except:variables.

## Git submodules
+ You can set the GIT_SUBMODULE_STRATEGY variable to either normal or recursive to tell the runner to fetch your submodules before the job:

```
variables:
  GIT_SUBMODULE_STRATEGY: recursive
```
+ For submodules located on the same GitLab server and configured with a Git or SSH URL, make sure you set the GIT_SUBMODULE_FORCE_HTTPS variable.

+ Use GIT_SUBMODULE_DEPTH to configure the cloning depth of submodules independently of the GIT_DEPTH variable
+ You can filter or exclude specific submodules to control which submodules are synchronized using GIT_SUBMODULE_PATHS.
+ You can provide additional flags to control advanced checkout behavior using GIT_SUBMODULE_UPDATE_FLAGS.

## cache
A cache is one or more files a job downloads and saves. Subsequent jobs that use the same cache don’t have to download the files again, so they execute more quickly.

* Define cache per job by using the cache keyword. Otherwise it is disabled.
* Subsequent pipelines can use the cache.
* Subsequent jobs in the same pipeline can use the cache, if the dependencies are identical.
* Different projects cannot share the cache.
* By default, protected and non-protected branches do not share the cache. However, you can change this behavior.

```
#
# https://gitlab.com/gitlab-org/gitlab/-/tree/master/lib/gitlab/ci/templates/Nodejs.gitlab-ci.yml
#
image: node:latest

# Cache modules in between jobs
cache:
  key: $CI_COMMIT_REF_SLUG
  paths:
    - .npm/

before_script:
  - npm ci --cache .npm --prefer-offline

test_async:
  script:
    - node ./specs/start.js ./specs/async.spec.js
```
### Where the caches are stored


Runner executor	Default path of the cache
Shell	Locally, under the gitlab-runner user’s home directory: /home/gitlab-runner/cache/<user>/<project>/<cache-key>/cache.zip.
Docker	Locally, under Docker volumes: /var/lib/docker/volumes/<volume-id>/_data/<user>/<project>/<cache-key>/cache.zip.
Docker Machine (autoscale runners)	The same as the Docker executor.

### clear cache
* Change the value for cache: key in your .gitlab-ci.yml file. The next time the pipeline runs, the cache is stored in a different location.

* You can clear the cache in the GitLab UI:


### How cache is different from artifacts
Use cache for dependencies, like packages you download from the internet. Cache is stored where GitLab Runner is installed and uploaded to S3 if distributed cache is enabled.

Use artifacts to pass intermediate build results between stages. Artifacts are generated by a job, stored in GitLab, and can be downloaded.

### disable cache
```
job:
  cache: []
```



## Artifacts



* Define artifacts per job.
* Subsequent jobs in later stages of the same pipeline can use artifacts.
* Different projects cannot share artifacts.
* Artifacts expire after 30 days by default. You can define a custom expiration time.
* The latest artifacts do not expire if keep latest artifacts is enabled.
* Use dependencies to control which jobs fetch the artifacts.


To create job artifacts, use the artifacts keyword in your .gitlab-ci.yml file:

```
pdf:
  script: xelatex mycv.tex
  artifacts:
    name: "%CI_JOB_STAGE%-%CI_COMMIT_REF_NAME%"
    paths:
      binaries/
    expire_in: 1 week
```
In this example, a job named pdf calls the xelatex command to build a PDF file from the LaTeX source file, mycv.tex.

The paths keyword determines which files to add to the job artifacts. All paths to files and directories are relative to the repository where the job was created.


```
test-job:
  stage: build
  cache:
    - key: cache-$CI_COMMIT_REF_SLUG
      fallback_keys:
        - cache-$CI_DEFAULT_BRANCH
        - cache-default
      paths:
        - vendor/ruby
  script:
    - bundle config set --local path 'vendor/ruby'
    - bundle install
    - echo Run tests...
```
In this example:
+ The job looks for the cache-$CI_COMMIT_REF_SLUG cache.
+ If cache-$CI_COMMIT_REF_SLUG is not found, the job looks for cache-$CI_DEFAULT_BRANCH as a fallback option.
+ If cache-$CI_DEFAULT_BRANCH is also not found, the job looks for cache-default as a second fallback option.
+ If none are found, the job downloads all the Ruby dependencies without using a cache, but creates a new cache for cache-$CI_COMMIT_REF_SLUG when the job completes.

### Prevent a job from fetching artifacts

```
job:
  stage: test
  script: make build
  dependencies: []
```
