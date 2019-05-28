var _form; // type: KASForm

function onPageLoad() {

    // Register for Android h/w back press event
    KASClient.App.registerHardwareBackPressCallback(function () {
        KASClient.App.dismissCurrentScreen();
    });

    // Get the default form
    KASClient.Form.initFormAsync(function (form, error) {
        _form = form;
    });
}

function backclicked(){
    KASClient.App.dismissCurrentScreen();
}

function submitClicked() {
    var messageText = document.getElementById('message-span').innerText;
    if (messageText == '') {
        // Display error message
        return;
    }

    var messageProperty = new KASClient.KASFormProperty();
    messageProperty.name = "message";
    messageProperty.type = KASClient.KASFormPropertyType.Text;
    messageProperty.value = messageText;
    _form.properties.push(messageProperty);

    KASClient.Form.submitFormRequest(_form, true /* shouldInflate */);
}
