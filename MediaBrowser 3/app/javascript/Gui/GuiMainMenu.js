var GuiMainMenu = {	
		menuItems : [],
		menuItemsHomePages : [],

		pageSelected : "",
		pageSelectedId : 0,
		pageSelectedClass : "",
		
		testModeCount : 0,
		testModeTimeout : null,
			
		isMusicPlaying : false,
		
		clockVar : null
}

GuiMainMenu.getSelectedMainMenuItem = function() {
	return this.selectedMainMenuItem;
}

//Entry Point from User Menu - ONLY RUN ONCE PER USER LOGIN
GuiMainMenu.start = function() {	
	//Generate Menu based on whethere there is any of (Folders, TV, Movies, .....)
	this.menuItems.length = 0;
	this.menuItemsHomePages.length = 0;
	
	//Generate main menu items
	this.menuItemsHomePages = Support.generateMainMenu(); 
	this.menuItems = Support.generateMainMenu();
	
	//Add Header Types
	var htmlToAdd = "<div id=headerUser style='text-align:center;padding-bottom:20px;'>"+Server.getUserName()+"</div>";	
	for (var index = 0; index < this.menuItems.length;index++) {
		htmlToAdd += "<div id=" + this.menuItems[index] + " style='padding-left:5px;'>" + this.menuItems[index].replace(/-/g, ' ').toUpperCase()+ "</div>";	
	}	
	document.getElementById("headerTypes").innerHTML = htmlToAdd;
	
	//Add settings and logout
	htmlToAdd = "";
	this.menuItems.push("Search");
	htmlToAdd += "<div id=Search style='padding-left:5px;'>SEARCH</div>";
	htmlToAdd += "<hr>";
	this.menuItems.push("Settings");
	htmlToAdd += "<div id=Settings style='padding-left:5px;'>SETTINGS</div>";
	this.menuItems.push("Contributors");
	htmlToAdd += "<div id=Contributors style='padding-left:5px;'>CONTRIBUTORS</div>";
	this.menuItems.push("Log-Out");
	htmlToAdd += "<div id=Log-Out style='padding-left:5px;'>LOG OUT</div>";	
	this.menuItems.push("Log-Out_Delete");
	htmlToAdd += "<div id=Log-Out_Delete style='padding-left:5px;'>LOG OUT & FORGET PASSWORD</div>";	
	document.getElementById("headerTypes").innerHTML += htmlToAdd;
	
	//Get User Image
	document.getElementById("headerUser").style.visibility = "";
	var userURL = Server.getServerAddr() + "/Users/" + Server.getUserID() + "?format=json&Fields=PrimaryImageTag";
	var UserData = Server.getContent(userURL);
	if (UserData == null) { return; }
	
	if (UserData.PrimaryImageTag) {
		var imgsrc = Server.getImageURL(UserData.Id,"UsersPrimary",60,60,0,false,0);
		document.getElementById("headerUserImage").style.backgroundImage = "url(" + imgsrc + ")";	
	} else {
		document.getElementById("headerUserImage").style.backgroundImage = "url(images/usernoimage.png)";
	}
	
	//Turn On Screensaver
	Support.screensaverOn();
	Support.screensaver();
	
	//Load Home Page
	var url1 = File.getUserProperty("View1");
	var title1 = File.getUserProperty("View1Name");
	var url2 = File.getUserProperty("View2");
	var title2 = File.getUserProperty("View2Name");
	
	if (url2 != null) {
		GuiPage_HomeTwoItems.start(title1,url1,title2,url2,0,0,true);
	} else {
		GuiPage_HomeOneItem.start(title1,url1,0,0);
	}
}

//Entry Point when called from any page displaying the menu
GuiMainMenu.requested = function(pageSelected, pageSelectedId, pageSelectedClass) {
	//Reset Menus
	this.selectedMainMenuItem = 0;
	this.selectedSubMenuItem = 0;
	
	//UnSelect Selected Item on whatever page is loaded
	this.pageSelected = pageSelected;
	this.pageSelectedId = pageSelectedId;
	
	//Unhighlights the page's selected content
	if (this.pageSelectedId != null) {
		if (pageSelectedClass === undefined) {
			this.pageSelectedClass = "UNDEFINED";
		} else {
			this.pageSelectedClass = pageSelectedClass;
		}
		document.getElementById(pageSelectedId).className = document.getElementById(pageSelectedId).className.replace("Selected","");
		document.getElementById(pageSelectedId).className = document.getElementById(pageSelectedId).className.replace("EpisodeListSelected","");
	}
		
	//Show Header
	document.getElementById("header").style.visibility = "";

	//Show submenu dependant on selectedMainMenuItem
	this.updateSelectedItems();
	
	//Set Focus
	document.getElementById("GuiMainMenu").focus();
}

GuiMainMenu.updateSelectedItems = function () {		
	for (var index = 0; index < this.menuItems.length; index++){	
		if (index == this.selectedMainMenuItem) {
			document.getElementById(this.menuItems[index]).className = "headerSelected";		
		} else {
			document.getElementById(this.menuItems[index]).className = "";
		}	
    }
}

//-------------------------------------------------------------
//      Main Menu Key Handling
//-------------------------------------------------------------
GuiMainMenu.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode)
	{	
		case tvKey.KEY_UP:
			alert("Up");
			this.processUpKey();
			break;	
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;		
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItems();
			break;	
		case tvKey.KEY_TOOLS:	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			//Allows blocking of return from menu if page has no selectable items
			this.processReturnKey();
			break;
		case tvKey.KEY_RED:
			this.toggleTestMode();
			break;	
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiMainMenu.processSelectedItems = function() {
	document.getElementById("header").style.visibility = "hidden";
	Support.processHomePageMenu(this.menuItems[this.selectedMainMenuItem]);
}

GuiMainMenu.processReturnKey = function() {
	if (this.pageSelected != null) {
		//As I don't want the settings page in the URL History I need to prevent popping it here (as its not added on leaving the settings page
		if (this.pageSelected != "GuiPage_Settings") {
			Support.removeLatestURL();
		}
		
		//Cheap way to unhighlight all items!
		this.selectedMainMenuItem = -1;
		this.updateSelectedItems();
		this.selectedMainMenuItem = 0;
		
		//Hide Header
		document.getElementById("header").style.visibility = "hidden";
		
		//Set Page GUI elements Correct & Set Focus
		if (this.pageSelectedId != null) {
			if (this.pageSelectedClass == "UNDEFINED") {
				document.getElementById(this.pageSelectedId).className = document.getElementById(this.pageSelectedId).className + " Selected";		
			} else {
				document.getElementById(this.pageSelectedId).className = this.pageSelectedClass;
			}
		}
		document.getElementById(this.pageSelected).focus();	
	}
}

GuiMainMenu.processUpKey = function() {
	this.selectedMainMenuItem--;
	if (this.selectedMainMenuItem < 0) {
		this.selectedMainMenuItem = this.menuItems.length-1;
	}
	this.updateSelectedItems();
}

GuiMainMenu.processDownKey = function() {
	this.selectedMainMenuItem++;
	if (this.selectedMainMenuItem >= this.menuItems.length) {
		this.selectedMainMenuItem = 0;
	}	
	this.updateSelectedItems();
}

GuiMainMenu.toggleTestMode = function() {
	if (this.testModeCount < 2) {
		this.testModeCount++;
		clearTimeout (this.testModeTimeout);
		this.testModeTimeout = setTimeout(function() {
			GuiMainMenu.testModeCount = 0;
		},3000)
	} else {
		clearTimeout (this.testModeTimeout);
		Main.setTestMode();
		GuiNotifications.setNotification("Test mode is now: " + Main.getTestMode(),"Test Mode");
		this.testModeCount = 0;
	}
}