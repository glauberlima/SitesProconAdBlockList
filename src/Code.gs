/*
The MIT License (MIT)

Copyright (c) 2016 Glauber Lima

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var Constants = {
	PROCON_LIST_URL: "http://sistemas.procon.sp.gov.br/evitesite/list/evitesite.php?action=list&jtStartIndex=0&jtPageSize=9999&jtSorting=strSite%20ASC",
	CACHE_KEY: "7c9fc2eb-01c8-4c18-8830-6139b686821f",
	CACHE_EXPIRATION_IN_SECONDS: 86400 // 1 day
};

function fetchSiteList() {
	"use strict";
	var response = UrlFetchApp.fetch(Constants.PROCON_LIST_URL);
	var responseAsString = response.getContentText();
	var siteList = JSON.parse(responseAsString);
	return siteList;
}

function generateAdBlockList(siteList) {
	"use strict";
	var output = "[Adblock Plus 2.0]\r\n";
	output += "! Title: Evite esses Sites - Fundação Procon/SP\r\n";
	output += "! Homepage: http://sistemas.procon.sp.gov.br/evitesite/list/evitesites.php\r\n";
	output += "! Expires: 1 day\r\n";
	output += "! Last modified: " + (new Date()).toUTCString() + "\r\n";
	output += "! Adaptação para Adblock Plus/uBlock Origin por Glauber Lima\r\n";
	for (var i = 0, m = siteList.Records.length; i < m; i++) {
		output += siteList.Records[i].strSite + "\r\n";
	}
	return output.trim();
}

var AdBlockProconList = {
	getSites: function() {
		var adBlockList,
			cache = CacheService.getPublicCache(),
			cached = cache.get(Constants.CACHE_KEY);
		if (cached) {
			adBlockList = cached;
		} else {
			var sites = fetchSiteList();
			adBlockList = generateAdBlockList(sites);
			cache.put(Constants.CACHE_KEY, adBlockList, Constants.CACHE_EXPIRATION_IN_SECONDS);
		}
		return ContentService.createTextOutput(adBlockList);
	}
};

// Entry point
function doGet(e) {
	"use strict";
	return AdBlockProconList.getSites();
}