//npm install prohashing 
//npm install system-sleep
//npm install nicehash

const prohashing = require("prohashing");
var sleep = require('system-sleep');
const NiceHashClient = require('nicehash');
var user = 'prohashuser';
const nh = new NiceHashClient({apiId: 'xxxxx', apiKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
var bal = 0;

 //sleep(140000);
const connection = new prohashing({ 
    apiKey: "xxxprohashingkeyxxx", 
    debug: true ,	
    subscribe : ['all']
})

connection.on("miners", (update) => {
   // console.log("miners")
    //console.log(update)
})
 
connection.on("minerStatus", (update) => {
    //console.log("MINER UPDATE")
   // console.log(update)
})
 
connection.on("connected", (details, session) => {
    console.log("Connected to Prohashing WAMP")
})
var diffs = [];
var count = 0;
var count2 = 0;
var maxVal = 0;
var maxValDiff = 0;
var minVal = 5445544545445;
var minValDiff = 0;
var valDiffs = [];
var coinNames = [];
var snapshot_value_usds = [];
connection.on("block", (block) => {
    //console.log("BLOCK UPDATE")
	for (blocks in block){
	if (block[blocks].algorithm == 'Scrypt'){
		//console.log(block[blocks]);
		//console.log('cur: ' + block[blocks].share_diff);
		if (block[blocks].share_diff <= 12000000000){
		coinNames[count] = block[blocks].coin_name;
		diffs[count] = block[blocks].share_diff;
		snapshot_value_usds[count] = block[blocks].snapshot_value_usd;
		valDiffs[count] = (1 / block[blocks].share_diff) * block[blocks].snapshot_value_usd;
		if (snapshot_value_usds[count] > maxVal){
			maxVal = snapshot_value_usds[count];
			maxValDiff = diffs[count];
		}
		if (snapshot_value_usds[count] < minVal){
			minVal = snapshot_value_usds[count];
			minValDiff = diffs[count];
		}
		var total = 0;
		var t2 = 0;
		for (diff in diffs){
			total = total + diffs[diff];
		}
		for (snaps in snapshot_value_usds){
			t2 = t2 + snapshot_value_usds[snaps];
		}
		//console.log('total: ' + total);
		var avg = total / diffs.length;
		var avg2 = t2 / snapshot_value_usds.length;
		if (count2 == 50){
		
		console.log('diff avg: ' + avg);
		console.log('value avg: ' + avg2);
		console.log('max val: ' + maxVal);
		console.log('max val diff: ' + maxValDiff);
		console.log('min val: ' + minVal);
		console.log('min val diff: ' + minValDiff);
		console.log('coinname: ' + coinNames[count]);
		console.log(' ');
		console.log('snapshot_value_usds: ' + snapshot_value_usds[count]);
		console.log('diffs: ' + diffs[count]);
		console.log('valDiffs: ' + valDiffs[count]);
		console.log(' ');
		console.log(' ');
		var bestvaldiff = 0;
		var bestcoin = "";
		var i = 0;
		for (valdiff in valDiffs){
			if (valDiffs[valdiff] > bestvaldiff){
				bestvaldiff = valDiffs[valdiff];
				bestcoin = coinNames[i];
			}
			i++;
		}
		if (bestcoin == undefined){
			diffs = [];
		count = 0;
		count2 = 0;
		maxVal = 0;
		maxValDiff = 0;
		minVal = 5445544545445;
		minValDiff = 0;
		valDiffs = [];
		coinNames = [];
		snapshot_value_usds = [];
		}
		else{
		console.log(bestcoin + ': ' + bestvaldiff);
		console.log(' ');
		console.log('c='+bestcoin.toLowerCase());
		console.log(' ');
		nh.getMyBalance().then((response) => {
			console.log(parseFloat(response.body.result.balance_confirmed));
			bal = parseFloat(response.body.result.balance_confirmed)
		});
		var lowestPrice = 1000000000;
		var lowestPrice2 = 1000000000;
		var l1 = 0;
		var l2 = 0;
		nh.getOrders(0, 0).then((response) => {
			var orders = response.body.result.orders;
			for (var order in orders){
				if (orders[order].accepted_speed > orders[order].limit_speed){
					if (orders[order].price < lowestPrice){
						lowestPrice = orders[order].price;
					}
				}
			}
			nh.getOrders(0, 0).then((response) => {
			var orders = response.body.result.orders;
			for (var order in orders){
				if (orders[order].accepted_speed > orders[order].limit_speed){
					if (orders[order].price <= (lowestPrice * 1.1)){
						l1 = l1 + parseFloat(orders[order].limit_speed);
					}
				}
			}
			console.log(l1);
			var orderOptions = {
				'location' : 0,
				'algo': 0,
				'amount': bal / 100,
				'limit': l1,
				'price': lowestPrice * 1.1,
				'pool_host': 'prohashing.com',
				'pool_port': 3333,
				'pool_user': user,
				'pool_pass': 'c='+bestcoin.toLowerCase() + ' n=' + bestcoin.toLowerCase() + '.' + bestvaldiff
			};
			
			nh.createOrder(orderOptions).then((response) => {
				console.log(response.body);
			});
			});
		});
		nh.getOrders(1, 0).then((response) => {
			var orders = response.body.result.orders;
			for (var order in orders){
				if (orders[order].accepted_speed > orders[order].limit_speed){
					if (orders[order].price < lowestPrice2){
						lowestPrice2 = orders[order].price;
					}
				}
			}nh.getOrders(1, 0).then((response) => {
			var orders = response.body.result.orders;
			for (var order in orders){
				if (orders[order].accepted_speed > orders[order].limit_speed){
					if (orders[order].price <= (lowestPrice2 * 1.1)){
						l2 = l2 + parseFloat(orders[order].limit_speed);
					}
				}
			}
			console.log(l2);
			var orderOptions2 = {
				'location' : 1,
				'algo': 0,
				'limit': l2,
				'amount': bal / 100,
				'price': lowestPrice2 * 1.1,
				'pool_host': 'prohashing.com',
				'pool_port': 3333,
				'pool_user': user,
				'pool_pass': 'c='+bestcoin.toLowerCase() + ' n=' + bestcoin.toLowerCase() + '.' + bestvaldiff
			};
			
			nh.createOrder(orderOptions2).then((response) => {
				console.log(response.body);
			});
			});
		});
		
		diffs = [];
		count = 0;
		count2 = 0;
		maxVal = 0;
		maxValDiff = 0;
		minVal = 5445544545445;
		minValDiff = 0;
		valDiffs = [];
		coinNames = [];
		snapshot_value_usds = [];
		}
		}
		count2++;
		console.log(count);
		count++;
		}
		
	}
	}
})
 
connection.on("systemStatus", (status) => {
    //console.log("STATUS", status)
})
connection.on("profitability", (status) => {
    //console.log("profitability", status)
})
