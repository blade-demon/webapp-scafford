let waitSeconds = (time) => {
  return new Promise((resolve, reject) => {
    console.log("doing");
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
