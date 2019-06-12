// Globals
var form; // type: KASForm
var currentUserInfo; // current user info we get from KASClient
var currentUserRank; // rank of user opening the card
var allUsersData; // all users data we get from properties
var currentUserStats; // json for current user details like name, score, phoneNo etc.
var strings; //strings from strings.json
var currentRegionStats = [];

/*Fields from excel */
const NAME = "Department";
const PHONENO = "PhoneNo";
const SCORE = "Variance";

const NO_OF_USERS_TO_DISPLAY = 10; //no. of users to display in tab 1

const MAX_NO_OF_PARAMETERS_TO_DISPLAY = 6; //even if more number of parameters are present in excel we display only these many

/*
initializeEventListeners(): Initialize the event listeners in the page
*/
function initializeEventListeners() {
    document.getElementById("back-button").addEventListener('click', KASClient.App.dismissCurrentScreen);
    document.getElementById("tab1").addEventListener('click', openTab);
    document.getElementById("tab2").addEventListener('click', openTab);
    document.getElementById("ok-button-div").addEventListener('click', KASClient.App.dismissCurrentScreen);
}

/*
setInitialText(): Initialize text strings
*/
function setInitialText() {
    document.getElementById('header-label').textContent = strings['displayName'];
    document.getElementById('tab1').textContent = strings['tab1Text'];
    document.getElementById('tab2').textContent = strings['tab2Text'];
    document.getElementById('error-message-title').textContent = strings['errorMessageTitle'];
    document.getElementById('error-message-subtitle').textContent = strings['errorMessageSubtitle'];
}

function showErrorDialogBox() {
    document.getElementById("error-message-outer-div").classList.add("flex");
    document.getElementById("error-message-inner-div").classList.add("flex");
}

/*
onPageLoad(): loads the response view (header,body) of the card
*/
function onPageLoad() {
    // Register for Android hardware backpress event
    KASClient.App.registerHardwareBackPressCallback(function () {
        KASClient.App.dismissCurrentScreen();
    });

    //Get the default form so that we can read it's properties which are pushed from flow
    KASClient.Form.initFormAsync(function (kasClientForm, error) {
        if (error != null) {
            showErrorDialogBox();
        }
        form = kasClientForm;
        allUsersData = JSON.parse(readProperties()["Tab1Data"]);
        // Get strings from strings.json file for display purposes
        KASClient.App.getLocalizedStringsAsync(function (localizedStrings, error) {
            if (error != null) {
                showErrorDialogBox();
            }
            strings = localizedStrings;
            setInitialText();
            initializeEventListeners();
        });
        // Fetch onversation details from which we can get current user ID.
        KASClient.App.getConversationDetailsAsync(function (conversationDetails, error) {
            if (error != null) {
                showErrorDialogBox();
            }
            // we will be using user details like phone number to identify current user in the card
            KASClient.App.getUsersDetailsAsync([conversationDetails.currentUserId], function (users, error) {
                if (error != null) {
                    showErrorDialogBox();
                }
                currentUserInfo = users[conversationDetails.currentUserId];
                showImmersivePage(updateCurrentRegion("United States"));
            });
        });
    });
}

/*
readProperties(): reads server properties which contains all user data from excel
*/
function readProperties() {
    // create simple dictionary out of form.properties - key being form property name and the value being form property value
    var properties = {};
    for (var i = 0; i < form.properties.length; i++) {
        properties[form.properties[i].name] = form.properties[i].value;
    }
    return properties;
}

/*
populateTab1Data(): Top 10 tab displays 10 users at the moment, each box(containing rank, name, score of user) is the participantDiv
*/
function populateTab1Data() {
    var tab1 = document.getElementById("tab1-content");
    tab1.innerHTML = '';
    var endRank = allUsersData.length < NO_OF_USERS_TO_DISPLAY ? allUsersData.length : NO_OF_USERS_TO_DISPLAY;
    for (var i = 1; i <= endRank; i++) {
        tab1.appendChild(createParticipantDiv(i, allUsersData[i - 1][NAME], allUsersData[i - 1][SCORE]));
    }
}

function createMyStatisticsHeadingBand(heading) {
    var headingBand = createDivGivenClassName("my-statistics-heading-band");
    headingBand.innerText = heading;
    return headingBand;
}

/** 
createNearByRanksHeadingBand(heading): make heading div which contains title
* @param {string} heading title for heading
**/
function createNearByRanksHeadingBand(heading) {
    var headingBand = createDivGivenClassName("near-by-ranks-heading-band");
    headingBand.innerText = heading;
    return headingBand;
}

/** 
createStatisticsDiv(): box containing all statistics of user
**/
function createStatisticsDiv() {
    var statisticsDiv = createDivGivenClassName("statistics");
    var dept = currentUserStats[NAME];
    if(dept.includes("Wealth"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("Wealth Processing"));
    else if(dept.includes("Legal"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("Legal"));
    else if(dept.includes("HR"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("HR"));
    else if(dept.includes("Finance"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("Finance"));
    else if(dept.includes("Compliance"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("Compliance"));
    else if(dept.includes("Treasury"))
        statisticsDiv.appendChild(createMyStatisticsHeadingBand("Treasury"));

    statisticsDiv.appendChild(createParametersDiv());
    return statisticsDiv;
}

/* getNoOfParameters(): no. of parameters user is judged by for score */
function getNoOfParameters() {
    return Object.keys(currentUserStats).length - 3; //3 accounts for Name, Score and PhoneNo - the rest of the fields are parameters
}

function populateTab2Data() {
    var tab2 = document.getElementById("tab2-content");
    tab2.innerHTML = '';
    var i=0,j=0;
    var dept = ["Legal","Finance","HR","Wealth Processing","Treasury","Compliance"];

    tab2.appendChild(addButtonsDiv());
    for (i = 0; i < currentRegionStats.length ; i++) {
        for (j = 0; j < currentRegionStats.length ; j++) {
            currentUserStats = currentRegionStats[j];
            if(currentUserStats[NAME].includes(dept[i])){
                //console.log(dept[i]);
                break;
            }
        }
        console.log("Stats-"+currentUserStats[NAME]);
        tab2.appendChild(createStatisticsDiv());
    }

    //tab2.appendChild(createNearByScorersDiv());
    

}

/**
addButtonsDiv() : Adds buttons to view further personal details such as Bonus and Target components
*/
function addButtonsDiv() {

    var buttonsDiv = createDivGivenClassName("search_categories");
    var frag = document.createDocumentFragment();
    var select = document.createElement("select");
    select.options.add(new Option("United States"));
    select.options.add(new Option("Japan"));
    select.options.add(new Option("Italy"));
    select.options.add(new Option("Singapore"));
    select.options.add(new Option("United Kingdom"));
    var id = document.createAttribute("id");
    id.value = "search_categories";
    select.setAttributeNode(id);
    select.addEventListener('change', changeRegion);
    frag.appendChild(select);
    buttonsDiv.appendChild(frag);

    /**var bonusButton = document.createElement("button");
    var idAttr = document.createAttribute("id");
    idAttr.value = "bonus-button";
    bonusButton.setAttributeNode(idAttr);
    var bonusButtonText = document.createTextNode("My Bonus");
    bonusButton.appendChild(bonusButtonText);
    bonusButton.addEventListener('click', openTab)
    buttonsDiv.appendChild(bonusButton);*/

    return buttonsDiv;

}

function changeRegion(event){
    var index = document.getElementById("search_categories").selectedIndex;
    showImmersivePage(updateCurrentRegion(event.target.value));
    displayTab2();
    console.log(index);
    document.getElementById("search_categories").selectedIndex = index;
}

/**
createParticipantDiv(): helper function to get generic participant div seen in both tabs
This is a box containing user details like name, rank and score.
* @param rank rank of user
* @param participantName name of participant
* @param participantScore associated score of participant
*/
function createParticipantDiv(rank, participantName, participantScore) {
    var participantDiv = createDivGivenClassName("participant-div");
    var innerParticipantDiv = document.createElement("div");
    var imgDiv = createDivGivenClassName("img-div");
    var userStatsDiv = createDivGivenClassName("user-stats-div");
    var userName = createDivGivenClassName("user-name");
    var userScore = document.createElement("div");

    var imgRank;

    if (rank > 3) {
        imgRank = document.createElement("span");
        imgRank.className = "rank-circle";
        imgRank.innerText = rank;
    } else {
        imgRank = document.createElement("div");
        imgRank.className = "rank-circle-position" + rank;
    }

    var userNameText = document.createElement("p");
    userNameText.innerText = participantName;

    var userScoreTextSpan = document.createElement("span");
    userScoreTextSpan.innerText = strings["scoreText"];
    userScoreTextSpan.className = "user-score-text";

    var userScoreSpan = document.createElement("span");
    userScoreSpan.innerText = participantScore;
    userScoreSpan.className = "user-score";

    userName.appendChild(userNameText);
    userScore.appendChild(userScoreTextSpan);
    userScore.appendChild(userScoreSpan);
    imgDiv.appendChild(imgRank);
    userStatsDiv.appendChild(userName);
    userStatsDiv.appendChild(userScore);
    userStatsDiv.appendChild(document.createElement("hr"));
    innerParticipantDiv.appendChild(imgDiv);
    innerParticipantDiv.appendChild(userStatsDiv);
    participantDiv.appendChild(innerParticipantDiv);

    return participantDiv;
}

/** 
createParamBar(title, subtitleText): helper class to get parameter box seen in tab 2 (only for current user)
* @param title main text in parameter box
* @param subtitleText subtitle text in parameter box
*/
function createParamBar(title, subtitleText) {
    var paramBar = document.createElement("div");
    paramBar.className = "param-bar";
    var innerParamBar = document.createElement("div");
    innerParamBar.className = "inner-param-bar";
    var subtitle = document.createElement("p");
    subtitle.innerText = subtitleText;
    subtitle.className = "param-subtitle";
    innerParamBar.appendChild(document.createTextNode(title));
    innerParamBar.appendChild(subtitle);
    paramBar.appendChild(innerParamBar);
    return paramBar;
}

/*
createParametersDiv(): get entire parameter div view containing all parameter bars
*/
function createParametersDiv() {
    var parametersDiv = document.createElement("div");
    parametersDiv.className = "parameters-div";

    var allParametersKeys = [];
    var i;

    for (i = 0; i < Object.keys(currentUserStats).length; i++) {
        if (Object.keys(currentUserStats)[i] != NAME)
            allParametersKeys.push(Object.keys(currentUserStats)[i]);
    }
    var noOfParams = allParametersKeys.length;

    noOfParams = noOfParams > MAX_NO_OF_PARAMETERS_TO_DISPLAY ? MAX_NO_OF_PARAMETERS_TO_DISPLAY : noOfParams;
    console.log(currentUserStats[NAME]);
    for (i = 0; i < noOfParams; i++) {
        parametersDiv.appendChild(createParamBar(currentUserStats[allParametersKeys[i]], allParametersKeys[i]));
    }

    return parametersDiv;
}

/**
 * createNearByScorersDiv(): show 4 users who have rank near the current user. 
 * It will try to show 2 users ranked higher and 2 users ranked lower than current user if possible.
 */
function createNearByScorersDiv() {
    var nearByScorersDiv = document.createElement("div");
    nearByScorersDiv.appendChild(createNearByRanksHeadingBand(strings['nearByScorersText']));

    var currentUserIndex = currentUserRank - 1;
    var startIndex = currentUserIndex - 2;
    var endIndex = currentUserIndex + 2;

    if (startIndex < 0) {
        startIndex = 0;
        endIndex = startIndex + 4 > allUsersData.length - 1 ? allUsersData.length - 1 : startIndex + 4;
    }
    if (endIndex >= allUsersData.length) {
        endIndex = allUsersData.length - 1;
        startIndex = endIndex > 4 ? (endIndex - 4) : 0;
    }

    for (var i = startIndex; i <= endIndex; i++) {
        if (i == currentUserIndex) { //if this index is currentUser
            nearByScorersDiv.appendChild(createCurrentUserDiv());
        } else {
            participantDiv = createParticipantDiv(i + 1, allUsersData[i][NAME], allUsersData[i][SCORE]);
            nearByScorersDiv.appendChild(participantDiv);
            //before current user
            if (i + 1 == currentUserIndex) {
                //has no horizontal line below and is smaller in size than other divs as a result
                participantDiv.classList.add("before-current-participant-div");
            }
        }
    }
    return nearByScorersDiv;
}

/**
 * isCurrentUserInLeaderboard(): checks if person opening the card is present in leaderboard
 */
function updateCurrentRegion(region) {
    currentRegionStats.splice(0,currentRegionStats.length)
    for (var i = 0; i < allUsersData.length; i++) {
        var dept = allUsersData[i][NAME];
        if (dept.includes(region)) {
            currentRegionStats.push(allUsersData[i]);
        }
    }
    return true;
}

/**
 * createDivGivenClassName(className): helper function to get div with class name
 * @param {string} className class to be assigned to div element
 */
function createDivGivenClassName(className) {
    var div = document.createElement("div");
    div.className = className;
    return div;
}

/**
 * inflateFooter(): make footer visible for tab1 and display current user box
 */
function inflateFooter() {
    var footer = document.getElementById("footer");
    footer.classList.add("visible");
    var currentUserDiv = createCurrentUserDiv();
    currentUserDiv.classList.add("current-user-footer");
    footer.appendChild(currentUserDiv);
}

/**
 * createCurrentUserDiv(): gets highlighted box for current user
 */
function createCurrentUserDiv() {
    var currentUserDiv = createDivGivenClassName("current-participant-div");
    var userStatsDiv = createDivGivenClassName("user-stats-div");
    var userName = document.createElement("div");

    var innerParticipantDiv = document.createElement("div");

    var imgDiv = createDivGivenClassName("img-div");
    imgDiv.classList.add("img-div-footer");

    var imgRank = document.createElement("span");
    imgRank.className = "current-rank-circle";
    imgRank.innerText = currentUserRank;

    var userNameText = document.createElement("p");
    userNameText.innerText = currentUserStats[NAME];
    userNameText.className = "current-user-name";


    var userScore = document.createElement("div");
    var userScoreTextSpan = document.createElement("span");

    userScoreTextSpan.innerText = strings["scoreText"];
    userScoreTextSpan.className = "user-score-text-footer";

    var userScoreSpan = document.createElement("span");
    userScoreSpan.innerText = currentUserStats[SCORE];
    userScoreSpan.className = "user-score-footer";

    userName.appendChild(userNameText);
    userScore.appendChild(userScoreTextSpan);
    userScore.appendChild(userScoreSpan);
    imgDiv.appendChild(imgRank);
    userStatsDiv.appendChild(userName);
    userStatsDiv.appendChild(userScore);
    innerParticipantDiv.appendChild(imgDiv);
    innerParticipantDiv.appendChild(userStatsDiv);
    currentUserDiv.appendChild(innerParticipantDiv);
    return currentUserDiv;
}

function showImmersivePage(updateCurrentRegion) {

        //inflateFooter();
        populateTab1Data();
        populateTab2Data();
}

function displayTab1() {
    document.getElementById("tab1").classList.add("active");
    document.getElementById("tab2").classList.remove("active");

    document.getElementById("tab1-content").classList.replace("hide", "visible");
    document.getElementById("tab2-content").classList.replace("visible", "hide");

    document.getElementById("footer").classList.replace("hide", "visible");
}

function displayTab2() {
    document.getElementById("tab2").classList.add("active");
    document.getElementById("tab1").classList.remove("active");

    document.getElementById("tab2-content").classList.replace("hide", "visible");
    document.getElementById("tab1-content").classList.replace("visible", "hide");

    document.getElementById("footer").classList.replace("visible", "hide");
}

function openTab(event) {
    if (event.target.id == 'tab1')
        displayTab1();
    else if(event.target.id == 'tab2')
        displayTab2();
}