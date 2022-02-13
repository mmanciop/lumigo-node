const lumigo = require('@lumigo/tracer');

const lumigoToken = "123";

const trace = (callback) => {
  if (process.env.isRunningTests) return callback;
  if (lumigoToken == null) {
    console.warn(
      `Attempted to trace the function, however, there is no 'LUMIGO_TOKEN' environment variable. Did you add it?
      Proceeding without tracing this function.`,
    );

    return callback;
  }

  console.log(lumigo);

  return lumigo({
    token: lumigoToken
  })
};


trace(()=>{

})
