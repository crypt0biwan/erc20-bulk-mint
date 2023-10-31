const { ethereum } = window

let provider = false
let signer = false

let connectedUserAccount = null

let ticker = '1m'
let max = 21000
let amount = 1000
    
function setConnected(isConnected, userAddr) {
    connectedUserAccount = userAddr
    
    document.querySelector('#info-connect').innerHTML = `Connected to <strong>${userAddr}</strong>`
    document.querySelector('#btn-connect').style.display = isConnected ? 'none' : 'block'
}

const ids = [
]

const convertToHexa = (str = '') =>{
    const res = [];
    const { length: len } = str;
    for (let n = 0, l = len; n < l; n ++) {
       const hex = Number(str.charCodeAt(n)).toString(16);
       res.push(hex);
    };
    return res.join('');
}

const checkExisting = (txts) => {
    let hashes = []

    txts.forEach(txt => {
        const encoded = `data:,${txt}`
        const hash = CryptoJS.SHA256(encoded).toString(CryptoJS.enc.Hex)
        hashes.push(hash)
    })

    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json")

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(hashes),
        redirect: 'follow'
    }

    return fetch("https://api.ethscriptions.com/api/ethscriptions/exists_multi", requestOptions)
}

const getUnused = async (number_of_mints) => {
    let numbers_try = []
    let txts = []
    let numbers = []

    do {
        for(let i=0; i<number_of_mints; i++) {
            let number = Math.ceil(Math.random() * max)
            numbers_try.push(number)
            txts.push(`{"p":"erc-20","op":"mint","tick":"${ticker}","id":"${number}","amt":"${amount}"}`)
        }

        let resp = await (await checkExisting(txts)).json()

        Object.keys(resp).forEach((key, i) => {
            let val = resp[key]

            if(val === null && numbers.length < number_of_mints) {
                numbers.push(numbers_try[i])
            }
        })

    } while (numbers.length < number_of_mints)

    return numbers
}

async function send_txs(number_of_mints) {
    let numbers = await getUnused(number_of_mints)

    for(let i=0; i<numbers.length; i++) {
        let number = numbers[i]
        let txt = `data:,{"p":"erc-20","op":"mint","tick":"${ticker}","id":"${number}","amt":"${amount}"}`
        let encoded = `0x${convertToHexa(txt)}`

        console.log(txt)
    
        const tx = {
            from: connectedUserAccount,
            to: connectedUserAccount,
            data: encoded
        }

        const signedTx = await signer.sendTransaction(tx)
        console.log('tx hash:', signedTx.hash)
    }
}

async function connectWallet() {
    console.log('connectWallet')
    
    await ethereum.request({
        method: 'eth_requestAccounts'
    });
    
    accts = await provider.listAccounts()
    
    let userAddr = accts[0]
    setConnected(true, userAddr);
}

if (ethereum) {
    provider = new ethers.providers.Web3Provider(ethereum);
    signer = provider.getSigner();
}

if (!provider) {
    console.error("Your browser is not web3 enabled.");
}

provider.listAccounts().then(accts => {
    if (accts && accts.length > 0) {
        let userAddr = accts[0]

        console.log("already connected; accts: " + userAddr);
        setConnected(true, userAddr);
    } else {
        console.log('Not connected')
        document.querySelector('#btn-connect').style.display = 'block'
    }
});

let html = ''
for(let i=1; i<=50; i++) {
    html += `<option value="${i}">${i}</option>`
}
document.getElementById('number_of_mints').innerHTML = html

document.querySelector('#btn-connect').addEventListener('click', connectWallet)

document.querySelector('#btn-mint').addEventListener('click', e => {
    e.preventDefault()

    ticker = document.getElementById('ticker').value
    amount = parseInt(document.getElementById('amount').value, 10)
    max = parseInt(document.getElementById('max').value, 10) / amount

    send_txs(parseInt(document.getElementById('number_of_mints').value, 10))
})
