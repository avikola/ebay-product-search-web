var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var path = require('path');
var cors = require('cors');
var request = require('request');

const express = require('express');


var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

const app = express()


app.use(express.static(__dirname));
app.use(cors());

// Routes:

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});



app.get('/similar/:itemid', (req, res) => {
    
    var theitem = req.params.itemid;
    
    var similar_url = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=Avishkar-Assignme-PRD-f16de56dc-810b0786&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId="+theitem+"&maxResults=20";

    console.log(similar_url);
    
    request(similar_url, function (err2, resp2, body2)
    {
        if (!err2 && resp2.statusCode == 200) 
        {
            var similarJSON = JSON.parse(body2);
            res.send(similarJSON);
        }
    });
});

app.get('/search/:searchurl', (req, res) => {
    var item_name = req.params.searchurl;
    
    var s_url = "https://www.googleapis.com/customsearch/v1?q="+encodeURIComponent(item_name)+"&cx=016306397051644386762:6pr7qy3ytzc&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyC8e2AP0Nz-fx6LIEZX2YJZQb-9PXbvscI";
    
    console.log(s_url);
    request(s_url, function(err3, resp3, body3){
        if (!err3 && resp3.statusCode == 200)
        {
            var searchJSON = JSON.parse(body3);
            res.send(searchJSON);
        }
    });
});

app.get('/details/:itemid', (req, res) => {
    
    var theitem = req.params.itemid;
    
    var details_text = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=Avishkar-Assignme-PRD-f16de56dc-810b0786&siteid=0&version=967&ItemID="+theitem+"&IncludeDetails=true&IncludeSelector=Description,Details,ItemSpecifics,ShippingDetails,ShippingCosts&OutputSelector=SellerInfo";
    
    console.log(details_text);
    request(details_text, function (err2, resp2, body2)
    {
        if (!err2 && resp2.statusCode == 200) 
        {
            var detailsJSON = JSON.parse(body2);
            res.send(detailsJSON);
        }
    });
});

app.get('/results', (req, res) => {
    
    var terms = req.query;
    var result_text = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=Avishkar-Assignme-PRD-f16de56dc-810b0786&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50";
    
    var keywords = terms.keyword;  
    var category = terms.category;
    
    switch(category)
    {
        case "art":
            category = "&categoryId=550";
            break;
            
        case "baby":
            category = "&categoryId=2984";
            break;
            
        case "books":
            category = "&categoryId=267";
            break;
            
        case "clothes":
            category = "&categoryId=11450";
            break;
            
        case "computers":
            category = "&categoryId=58058";
            break;
            
        case "health":
            category = "&categoryId=26395";
            break;
            
        case "music":
            category = "&categoryId=11233";
            break;
            
        case "games":
            category = "&categoryId=1249";
            break;
            
        default:
            category = "";            
    }
    
    result_text += "&keywords="+keywords+category;
    
    var loc = terms.location;
    
    result_text += "&buyerPostalCode="+loc;
    
    var dist = terms.distance;
    
    var new1 = terms.new;
    var used = terms.used;
    var unspecified = terms.unspecified;
    var free = terms.free_shipping;
    var local = terms.local_pickup;
    
    result_text += "&itemFilter(0).name=MaxDistance&itemFilter(0).value="+dist;
    result_text += "&itemFilter(1).name=FreeShippingOnly&itemFilter(1).value="+free+"&itemFilter(2).name=LocalPickupOnly&itemFilter(2).value="+local+"&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true";
    
    if (new1=="true" || used=="true" || unspecified=="true")
    {
        result_text += "&itemFilter(4).name=Condition";
    }
    
    var c = 0;
    if(new1=="true")
    {
        result_text += "&itemFilter(4).value("+c+")=New";
        c++;
    }
    
    if(used=="true")
    {
        result_text += "&itemFilter(4).value("+c+")=Used";
        c++;
    }
    
    if(unspecified=="true")
    {
        result_text += "&itemFilter(4).value("+c+")=Unspecified";
    }
    
    result_text += "&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo";
    console.log(result_text);
    request(result_text, function (err, resp1, body)
    {
        if (!err && resp1.statusCode == 200) 
        {
            var resultsJSON = JSON.parse(body);
            res.send(resultsJSON);
        }
    });
    
});

app.listen(port, () => console.log(`App is listening on port ${port}!`))

