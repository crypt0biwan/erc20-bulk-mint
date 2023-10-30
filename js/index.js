const { ethereum } = window

let provider = false
let signer = false

let connectedUserAccount = null

let ticker = 'facet'
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

const getUnused = () => {
    let number = Math.ceil(Math.random() * max)

    do {
        number = Math.ceil(Math.random() * max)
    } while (ids.includes(number))

    return number
}

async function send_txs(number_of_mints) {
    for(let i=0; i<number_of_mints; i++) {
        let number = getUnused()
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
