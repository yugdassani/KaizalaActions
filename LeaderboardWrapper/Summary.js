var _form; // type: KASForm
var questionToAnswerMap = {};
var properties = [];

function onPageLoad() {

    // Register for Android h/w back press event
    KASClient.App.registerHardwareBackPressCallback(function () {
        KASClient.App.dismissCurrentScreen();
    });

    // Get the default form
    KASClient.Form.getFormAsync(function (form, error) {
        _form = form;
        readProperties();
        showSummaryPage();
    });
}

function readProperties() {
    var prop = _form.properties;
    for (var i = 0; i < prop.length; i++) {
        properties[prop[i].name] = prop[i].value;
    }
}

function backclicked(){
    document.getElementById('error-field').innerText = "";
    document.getElementById('message-field').innerText = "";
    KASClient.App.dismissCurrentScreen();
}

function showSummaryPage() {
    KASClient.Form.submitFormRequest(_form, true /* shouldInflate */);
    /**KASClient.App.performAuthenticationAsync(
        KASClient.KASAuthenticationType.FingerPrint, 
        function(isSuccessful, error){
            if(isSuccessful){
                KASClient.Form.submitFormRequest(_form, true /* shouldInflate /);
                //document.getElementById('error-field').innerText = "";
                //document.getElementById('message-field').innerText = properties["message"];
            } else {
                document.getElementById('error-field').innerText = 
                "Authentication failed! To try again, close the card and open again.";
                document.getElementById('message-field').innerText = "";
            }
    });*/
}