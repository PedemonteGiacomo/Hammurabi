# Hammurabi Codebase Overview

This repository contains a React application for viewing DICOM images and the AWS infrastructure required to deploy it. The project is divided into a UI package, a CDK stack and a small utility script.

## Repository layout

```
.
├── Hammurabi/
│   ├── hammurabi-ui/        # React/TypeScript front‑end
│   └── obtain_table_data.py # CSV → JSON converter for test data
├── hammurabi-cdk/           # AWS CDK infrastructure (Python)
│   ├── app.py               # entry point that synthesizes stacks and diagrams
│   ├── react_ecs_cdk/       # basic ECS/Fargate stack
│   ├── react_ecs_complete_cdk/ # full stack with WAF, Cognito and CodeDeploy
│   └── tests/               # example unit test
├── .github/workflows/ci.yml # CI/CD pipeline
└── README.md                # this file
```

## Front‑end (`hammurabi-ui`)

* Bootstrapped with **Create React App** and configured through `craco`.
* The UI is schema driven: JSON files under `src/schema` describe layouts and map to React components located in `src/components`. See `src/schema/README.md` for a step‑by‑step guide on adding new widgets.
* `newViewer.tsx` implements an advanced DICOM viewer with metadata support.
* Environment variables are injected at runtime by `env-config.js.template` and `entrypoint.sh` (see the Dockerfile for details).

### Development

```bash
cd Hammurabi/hammurabi-ui
npm install
npm start
```

The app will be available on <http://localhost:3000>. Vitest can be run with `npm test`.

### Container build

```bash
docker build -t hammurabi-ui-prod .
```

## Infrastructure (`hammurabi-cdk`)

* AWS CDK project written in Python.
* `ReactEcsCdkStack` deploys a minimal Fargate service.
* `ReactCdkCompleteStack` deploys the full environment with CloudFront, WAF, Cognito (Google IdP) and CodeDeploy blue/green deployments.
* `app.py` instantiates the complete stack and uses `aws-pdk` to generate an architecture diagram.

### Deploy

```bash
cd hammurabi-cdk
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk deploy ReactCdkCompleteStack
```

## CI/CD

`.github/workflows/ci.yml` builds the UI Docker image, pushes it to ECR, deploys the CDK stack and performs a blue/green ECS deployment through CodeDeploy. Google OAuth secrets are injected during the workflow.

## Data utility

`Hammurabi/obtain_table_data.py` converts an NBIA CSV manifest into a nested JSON structure used by the viewer. Configure the input paths at the top of the script before execution.

## Further reading

* `src/schema/README.md` – how to create new schema‑driven widgets.
* `react_ecs_complete_cdk/react_ecs_complete_cdk_stack.py` – details of the production stack.
* `.github/workflows/ci.yml` – reference for the full deployment pipeline.

This README serves as a starting point for developers picking up the project and as a summary of the current implementation.
