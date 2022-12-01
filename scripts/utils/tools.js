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

const errorMsg = (message) => {
  console.log('\x1b[31m');
  console.log(message , { 'colors': false, "depth": null });
  console.log('\x1b[0m');
};

const errorMessage = (type , message) => {
  console.log(`-------------------------${type} FAILED --------------------------`);
  console.log(message );
};

 

const printMessage = (message) => { 
  console.log(message );
}

module.exports = {
  processArgs,
  errorMsg,
  errorMessage,
  printMessage,
};