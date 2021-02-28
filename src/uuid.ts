/*
 * @Author: iy88 
 * @Date: 2020-05-02 11:49:20 
 * @Last Modified by: iy88
 * @Last Modified time: 2021-02-27 22:18:47
 */
function cu():string {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return Math.random() > 0.5 ?
      (c === 'x' ?
        r :
        (r & 0x3 | 0x8))
        .toString(16) :
      (c === 'x' ?
        r :
        (r & 0x3 | 0x8))
        .toString(16)
        .toUpperCase();
  });
}

export default cu;