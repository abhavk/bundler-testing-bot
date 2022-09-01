import Axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance } from "axios";
import Bundlr from "@bundlr-network/client";
const fs = require('fs');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');

const wallet_path = process.argv[2];
const file_path = process.argv[3];
var privateKey = JSON.parse(fs.readFileSync(wallet_path))
const { Console } = require("console");
const console = new Console({
  stdout: fs.createWriteStream("normalStdout.txt"),
  stderr: fs.createWriteStream("errStdErr.txt"),
});


const scheduler = new ToadScheduler();
const instance = Axios.create({
    baseURL: "http://m-testnet.arweave.net:1984",
    timeout: 20000,
    maxContentLength: 1024 * 1024 * 512,
  });
const task = new AsyncTask('verify and send', () => verifyOldAndSendNew());
const job = new SimpleIntervalJob({ minutes: 5 }, task);
const bundler = new Bundlr("http://m-testnet.arweave.net:3000", "arweave", privateKey);
scheduler.addSimpleIntervalJob(job)

let oldTxId;

async function verifyOldAndSendNew() {
	if (oldTxId) {
		const oldTx = await instance.get(`/${oldTxId}`);
		console.log(`Checking old tx ${oldTxId}, received response ${oldTx.status}.`);
		if (oldTx.status == 200) {
			// SUCCESS
		} else {
			// SEND ALERTS!
		}
	} 
	const response = await bundler.uploadFile(file_path);
	console.log("DataItem id = ", response.data.id);
	oldTxId = response.data.id;
}

