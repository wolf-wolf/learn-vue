/**
 * 测试promise串行，返回所有结果
 */
function promisesSyncTest() {
    function promisesSync(arr) {
        let finalRes = [];
        return new Promise(resolve => {
            function _innerPromisesSync(arr) {
                let currPromise = arr.pop();
                if (currPromise) {
                    return currPromise.then((res) => {
                        finalRes.unshift(res);
                        return _innerPromisesSync(arr)
                    })
                } else {
                    resolve(finalRes.reverse())
                }
                return ''
            }

            _innerPromisesSync(arr)
        })
    }

    let promise1 = new Promise(resolve => {
        setTimeout(() => {
            resolve('promise1')
        }, 1000)
    });

    let promise2 = new Promise(resolve => {
        setTimeout(() => {
            resolve('promise2')
        }, 2000)
    });

    let promise3 = new Promise(resolve => {
        setTimeout(() => {
            resolve('promise3')
        }, 3000)
    });

    console.log('执行 promisesSync')
    promisesSync([promise1, promise2, promise3]).then(res => {
        console.log('promisesSync', res)
    })
}

function promiseSyncTestUseBefore() {
    function promisesSync(arr) {
        let finalRes = [];
        return new Promise(resolve => {
            function _innerPromisesSync(arr, beforeRes) {
                let currPromise = arr.pop();
                if (currPromise) {
                    return currPromise(beforeRes).then((res) => {
                        finalRes.push(res);
                        return _innerPromisesSync(arr, res)
                    })
                } else {
                    resolve(finalRes)
                }
                return ''
            }

            _innerPromisesSync(arr)
        })
    }

    let promise1 = (time) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(1000)
            }, time)
        });
    }

    let promise2 = (time) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(2000)
            }, time)
        });
    }

    let promise3 = (time) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(4000)
            }, time)
        });
    }

    console.log('执行 promisesSync')
    promisesSync([promise1, promise2, promise3]).then(res => {
        console.log('promisesSync', res)
    })
}

promisesSyncTest()
promiseSyncTestUseBefore()



