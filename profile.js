var http = require('http');
var fs = require('fs');

var calcCareerDuration = function (year, month) {
    var currentTime = new Date().getTime();
    var sinceTime = new Date(year, month, '01').getTime();
    var duration = currentTime - sinceTime;
    return duration / 31536000000; // 1year milliseconds
};

var getKeysFromHtml = function (html) {
    return html.match(/{([a-zA-Z.]*)}/g);
}

var getValueFromKeyString = function (json, keyString) {
    var keyArray = keyString.split('.');
    var value = null;
    keyArray.forEach(function (key, index, array) {
        try {
            if (index == 0) {
                value = json[key];
            } else {
                value = value[key];
            }
        } catch (e) {}
    });
    return value;
};

var generateHtml = function (lang, json, html) {
    var detail = json.detail[lang];
    var keyStrings = getKeysFromHtml(html);
    keyStrings.forEach(function (keyString, index, array) {
        var genKey = keyString.replace('{', '').replace('}', '');
        var value = getValueFromKeyString(json, genKey);
        if (!value) {
            value = getValueFromKeyString(detail, genKey);
        }
        if (value) {
            if (typeof value == 'object') {
                value = value.join(',');
            }
            html = html.replace(keyString, value);
        }
    });

    var careerYear = json.careerStartAt.year;
    var careerMonth = json.careerStartAt.month;
    if (careerMonth < 10) {
        careerMonth =+ "0";
    }
    var careerDuration = calcCareerDuration(careerYear, careerMonth).toFixed(1);
    html = html.replace('{careerDuration}', careerDuration);

    return html;
};

var server = http.createServer(function (request, response) {
    var jsonText = fs.readFileSync('profile.json');
    var htmlTemplate = fs.readFileSync('profile.html').toString();
    var profile = JSON.parse(jsonText);
    var urlPaths = request.url.split('/').slice(1);
    var responseHtml = generateHtml(urlPaths[1], profile, htmlTemplate);
    response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
    });
    response.end(responseHtml);
});
server.listen(920, function () {
    console.log('---- listen port 920 ---');
});