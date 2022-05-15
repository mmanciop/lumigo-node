# lumigo-node :stars:
[![CircleCI](https://circleci.com/gh/lumigo-io/lumigo-node.svg?style=svg&circle-token=47f40cb5e95e8532e73f69754fac65830b5e86a1)](https://circleci.com/gh/lumigo-io/lumigo-node)
[![codecov](https://codecov.io/gh/lumigo-io/lumigo-node/branch/master/graph/badge.svg?token=mUkKlI8ifC)](https://codecov.io/gh/lumigo-io/lumigo-node)
[![npm version](https://badge.fury.io/js/%40lumigo%2Ftracer.svg)](https://badge.fury.io/js/%40lumigo%2Ftracer)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


This is [`@lumigo/tracer`](https://), Lumigo's Node.js agent for distributed tracing and performance monitoring.

Supported NodeJS runtimes: 8.10, 10.x, 12.x, 14.x

## Usage 

The `@lumigo/tracer` package allows you to pursue automated metric gathering through Lambda Layers, automated metric gathering and instrumentation through the Serverless framework, or manual metric creation and implementation.

### Including the tracer through a Lambda layer

The tracer is also provided via Lambda layers that can be [included directly in your functions](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).
The ARNs of these Lambda layers, one per AWS region, are available [here](https://github.com/lumigo-io/lumigo-node/blob/master/layers).

**Note:** Using the Lambda layer for including the tracer is optional.

### Including the tracer via the Serverless framework

If your Lambda function uses the [Serverless Framework](https://www.serverless.com/), the tracer is also available as the [`serverless-lumigo-plugin`](https://github.com/lumigo-io/serverless-lumigo-plugin/blob/master/README.md).
FOr more information on how to install plugins with the Serverless Framework, refer to the [Plugins](https://www.serverless.com/framework/docs/guides/plugins) documentation.

### Manual inclusion

The tracer delivered over the `@lumigo/tracer` Node.js package, and you can add it to the dependencies of your function as any other package:

~~~bash
$ npm i @lumigo/tracer
# or
$ yarn add @lumigo/tracer
~~~

Next, wrap your `handler` in Lumigo's `trace` function:

#### Javascript

~~~js
// javascript
const lumigo = require('@lumigo/tracer')()

const myHandler = async (event, context, callback) => { ... }

exports.handler = lumigo.trace(myHandler)
~~~

#### Typescript

~~~typescript
// typescript
import lumigo from '@lumigo/tracer';

const myHandler = async (event, context, callback) => { ... }

exports.handler = lumigo({ token: 'YOUR-TOKEN-HERE' }).trace(myHandler)
~~~

You must add the following to your `tsconfig.json` file:
~~~json
{
  ...,
  "esModuleInterop": true,  
}
~~~
[read more about it here](https://www.typescriptlang.org/tsconfig#esModuleInterop)

### Set the Lumigo token

The tracer needs an authentication token to send data to the Lumigo endpoint by setting `LUMIGO_TRACER_TOKEN` environment variable of your Lambda function; refer to the [Using AWS Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-encryption) documentation for more information.
Your Lumigo token is available in Settings -> Tracing -> Manual tracing.

We advise you to use the most secure available to you to store secrets such as your `LUMIGO_TRACER_TOKEN`; additionally, AWS provides integrations for AWS Key Management Service that keep the values of your Lambda environment variables secure.

## Configuration

`@lumigo/tracer` offers the following configuration options, to be [set as environment variables to your Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-encryption):

* `LUMIGO_DEBUG=TRUE`: Enables debug logging
* `LUMIGO_SECRET_MASKING_REGEX='["regex1", "regex2"]'`: Prevents Lumigo from sending keys that match the supplied regular expressions. All regular expressions are case-insensitive. By default, Lumigo applies the following regular expressions: `[".*pass.*", ".*key.*", ".*secret.*", ".*credential.*", ".*passphrase.*"]`. **Note:** Refer to the [Scrubbing limitations](#scrubbing_limitations) section for the limitations that apply to secrets scrubbing.
* `LUMIGO_DOMAINS_SCRUBBER='[".*secret.*"]'`: Prevents Lumigo from collecting both request and response details from a list of domains. This accepts a comma-separated list of regular expressions that is JSON-formatted. By default, the tracer uses `["secretsmanager\..*\.amazonaws\.com", "ssm\..*\.amazonaws\.com", "kms\..*\.amazonaws\.com"]`. **Note:** These defaults are overridden when you define a different list of regular expressions.
* `LUMIGO_SWITCH_OFF=TRUE`: In the event a critical issue arises, this turns off all actions that Lumigo takes in response to your code. This happens without a deployment, and is picked up on the next function run once the environment variable is present.

### Step Functions

If your function is part of a set of step functions, the Lumigo tracer can track all states in the step function as a single transaction by adding the flag `step_function: true` to the Lumigo tracer import when using the [manual inclusion](#manual_inclusion):

```js
const lumigo = require('@lumigo/tracer')({ step_function: true })
```

Alternatively, you can set the environment variable `LUMIGO_STEP_FUNCTION=True`.

**Note:** the tracer adds the key `"_lumigo"` to the return value of the function. 

If you override the `"Parameters"` configuration, add `"_lumigo.$": "$._lumigo"` to ensure this value is still present.

Below is an example configuration for a Lambda function that is part of a step function that has overridden its parameters:

```
"States": {
    "state1": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-west-2:ACCOUNT:function:FUNCTION_NAME",
      "Parameters": {
          "Changed": "parameters",
          "_lumigo.$": "$._lumigo"
        },
      "Next": "state2"
    },
    "state2": {
      "Type": "pass",
      "End": true
    }
}
```

## Logging Programmatic Errors

To add custom errors visible in the Lumigo platform, add the following code to your Function:

```js
console.log("[LUMIGO_LOG] <YOUR_MESSAGE>");
```

## Adding Execution Tags
You can add execution tags to a function with dynamic values using the parameter `addExecutionTag`.

These tags will be searchable from within the Lumigo platform.

### Adding execution tags

You can add tags to the tracing data collected by the Lumigo tracer as follows:

```js
lumigo.addExecutionTag('<key>', '<value>');
```

Execution tags are subject to the following limitations:

* The maximum number of tags is 50. 
* Key length must be between 1 and 50.
* Value length must be between 1 and 70.

### Scrubbing Limitations

Secrets scrubbing is supported only for JSON-formatted data.
