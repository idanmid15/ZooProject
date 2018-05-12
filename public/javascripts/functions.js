function redirectTo(suffix) {
    window.location.href = appendToCurrentPath(suffix);
}


function appendToCurrentPath(suffix) {
    return window.location.href.split("8080")[0] + "8080/" + suffix;
}

function logOut() {
    sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("logout"), function(e){alert("logging out")});
    redirectTo("public/hello.html");
}

function goBack() {
    window.location.href = document.referrer;
}

function sendXhrAndRunFunctionAsync(methodType, url, func, sendJson, shouldAlert) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open(methodType, url, true);
    if (typeof sendJson !== 'undefined') {
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(sendJson);
    } else {
        xmlhttp.send();
    }

    shouldAlert = typeof shouldAlert === 'undefined' ? true : shouldAlert
    console.log("shouldAlert = " + shouldAlert)
    xmlhttp.onreadystatechange = function() {
        if(this.readyState === 4 && xmlhttp.status === 200) {
            func(xmlhttp);
        } else if (this.readyState === 4 && shouldAlert && (xmlhttp.status === 404 || xmlhttp.status === 500)) {
             alert("Error");
        }
    }
}