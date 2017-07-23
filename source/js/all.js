let waitSeconds = (time) => {
  return new Promise((resolve, reject) => {
    console.log("This is a async test..");
    return setTimeout(()=>{
      resolve();
    },time)
  });
}

(async () => {
  console.log("start");
  await waitSeconds(3000);
  console.log("end");
})();

// console.log("This is js file 1.");