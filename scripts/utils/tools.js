const processArgs = (args = []) => {
    const argsAndValues = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (/^--.+/.test(arg)) {
        const key = arg.match(/^--(.+)/)[1];
        const next = args[i + 1];
        if (/^--.+/.test(next)) {
          argsAndValues[key] = false;
          continue;
        }
        argsAndValues[key] = next;
        i++;
      }
    }
    return argsAndValues;
  };

  const errorMessage = (type , message) => {
    console.error(`\x1b[31m -------------------------${type} FAILED -------------------------- \x1b[5m`);
    console.error(`\x1b[33m ${message} \x1b[1m`);
  };
  
  const printMessage = (message) => { 
    //console.dir(message , { 'colors': true, "depth": null });
    console.log(`\x1b[32m ${message} \x1b[0m`);
  }

  module.exports = {
    processArgs,
    errorMessage,
    printMessage,
  };