var GuiPage_Search = {
		ItemData : null,
		startParams : [],
		
		selectedItem : 0,
		selectedItem2 : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 12,
		
		playItems : ["Play_","View_"]
}

GuiPage_Search.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_Search.start = function(title, url) {
	//Reset Properties
	this.ItemData = null;
	this.selectedItem = 0;
	this.selectedItem2 = 0;
	this.startParams = [],
		
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div id='title' class='EpisodesSeriesInfo'>Search</div><div class='SearchPageInput'> \
		<form><input id='searchInput' type='text' size='50' value=''/></form> \
		</div><div id='ResultsTitle' class='SearchPageTitle'></div><div id=Results class='SearchPageResults'></div>";
	
	//Allows time for innerhtml to execute before creating ime
	setTimeout(function () {
		//Create IME
		new GuiPage_Search_Input();
		
		if (title !== undefined && url !== undefined && title != null && url != null) {
			GuiPage_Search.ItemData = Server.getContent(url);
	    	if (GuiPage_Search.ItemData == null) { return; }
	    	
	    	document.getElementById("ResultsTitle").innerHTML = title;
	    	
	    	if (GuiPage_Search.ItemData.SearchHints.length > 0) {
	    		GuiPage_Search.startParams[0] = title;
	    		GuiPage_Search.startParams[1] = url;
	        	GuiPage_Search.updateDisplayedItems();
	        	GuiPage_Search.updateSelectedItems();
	        	document.getElementById("GuiPage_Search").focus();
	    	} else {
	    		//Must turn off as cannot catch keys during IME!
	    		Support.screensaverOff();
	    		document.getElementById("searchInput").focus();
	    	}
		} else {
			//Must turn off as cannot catch keys during IME!
			Support.screensaverOff();
			document.getElementById("searchInput").focus();
		}
	}, 500);	
}

GuiPage_Search.updateDisplayedItems = function() {
	htmlToAdd = "<table><th style='width:33px'></th><th style='width:36px'></th><th style='width:300px'></th><th style='width:50px'></th>";
	var epName = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.SearchHints.length); index++){
		epName = (this.ItemData.SearchHints[index].Type == "Episode") ? Support.getNameFormat(null,this.ItemData.SearchHints[index].ParentIndexNumber,null,this.ItemData.SearchHints[index].IndexNumber) + " - " + this.ItemData.SearchHints[index].Name : this.ItemData.SearchHints[index].Name;
		htmlToAdd += "<tr><td id=Play_"+this.ItemData.SearchHints[index].ItemId+" class='musicTableTd'>Play</td><td id=View_"+this.ItemData.SearchHints[index].ItemId+" class='musicTableTd'>View</td>" +
				"<td id="+ this.ItemData.SearchHints[index].ItemId +" class='musicTableTd'>" + epName + "</td><td id=Type_"+ this.ItemData.SearchHints[index].ItemId +" class='musicTableTd'>" + this.ItemData.SearchHints[index].Type + "</td></tr>";		
	}
	document.getElementById("Results").innerHTML = htmlToAdd + "</table>";
}

//Function sets CSS Properties so show which user is selected
GuiPage_Search.updateSelectedItems = function () {
	//Finds correct items to set Red / Green
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.SearchHints.length); index++){	
		if (index == this.selectedItem) {
			document.getElementById(this.ItemData.SearchHints[index].ItemId).style.color = "green";
			for (var index2 = 0; index2 < this.playItems.length; index2++) {
				if (index2 == this.selectedItem2) {
					document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "musicTableTd red";
				} else {
					document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "musicTableTd";
				}
			}
		} else {
			document.getElementById(this.ItemData.SearchHints[index].ItemId).style.color = "white";
			for (var index2 = 0; index2 < this.playItems.length; index2++) {
				document.getElementById(this.playItems[index2]+this.ItemData.SearchHints[index].ItemId).className = "musicTableTd";
			}
		}
	}

	//Set Counter to be album count or x/3 for top part
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.ItemData.SearchHints.length;	
}

GuiPage_Search.processSelectedItem = function() {
	Support.updateURLHistory("GuiPage_Search",this.startParams[0],this.startParams[1],null,null,0,0,null);
	switch (this.ItemData.SearchHints[this.selectedItem].Type) {
	case "Episode":
	case "Movie":
		if (this.playItems[this.selectedItem2] == "Play_") {
			//Play URL
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,"&ExcludeLocationTypes=Virtual");
			GuiPlayer.start("PLAY",url,0,"GuiPage_Search");
		} else if (this.playItems[this.selectedItem2] == "View_") {
			//Display Item Page
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,null);
			GuiPage_ItemDetails.start(this.ItemData.SearchHints[this.selectedItem].Name,url,0);
		}
		break;
	case "Series":
		if (this.playItems[this.selectedItem2] == "Play_") {
			//Play URL
			var url= Server.getChildItemsURL(this.ItemData.SearchHints[this.selectedItem].ItemId,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
			GuiPlayer.start("PlayAll",url,0,"GuiPage_Search");
		} else if (this.playItems[this.selectedItem2] == "View_") {
			//Display Item Page
			var url = Server.getItemInfoURL(this.ItemData.SearchHints[this.selectedItem].ItemId,null);
			GuiTV_Show.start(this.ItemData.SearchHints[this.selectedItem].Name,url,0,0);
		}
		break;	
	default:
		Support.removeLatestURL();
		GuiNotifications.setNotification(this.ItemData.SearchHints[this.selectedItem].Type + " hasn't been implemented in search yet.", "To Be Done")
	}
}

//////////////////////////////////////////////////////////////////
//Input method for entering user password                     //
//////////////////////////////////////////////////////////////////
var GuiPage_Search_Input  = function() {   
var imeReady = function(imeObject) {    	
	installFocusKeyCallbacks(); 
}

var ime = new IMEShell("searchInput", imeReady,'en');
ime.setKeypadPos(680,90);
       
var installFocusKeyCallbacks = function () {
    ime.setKeyFunc(tvKey.KEY_ENTER, function (keyCode) {
        alert("Enter key pressed");    
        var searchString = document.getElementById("searchInput").value;
        if (searchString != "") {
        	//Load Data
        	var url = Server.getSearchURL(searchString);
        	GuiPage_Search.ItemData = Server.getContent(url);
        	if (GuiPage_Search.ItemData == null) { return; }
        	
        	document.getElementById("ResultsTitle").innerHTML = GuiPage_Search.ItemData.TotalRecordCount + " Results for: " + searchString;
        	ime.setString("");
        	
        	if (GuiPage_Search.ItemData.SearchHints.length > 0) {
        		
        		//Turn On Screensaver
        	    Support.screensaverOn();
        		Support.screensaver();
        		
        		GuiPage_Search.startParams[0] = document.getElementById("ResultsTitle").innerHTML;
        		GuiPage_Search.startParams[1] = url;
        		GuiPage_Search.selectedItem = 0;
            	GuiPage_Search.updateDisplayedItems();
            	GuiPage_Search.updateSelectedItems();
            	document.getElementById("GuiPage_Search").focus();
        	}
        } 	
    });
    
    ime.setKeyFunc(tvKey.KEY_DOWN, function (keyCode) {
    	alert ("Down Key IME: " + GuiPage_Search.ItemData.TotalRecordCount);
    	if (GuiPage_Search.ItemData.TotalRecordCount > 0) {
    		//Turn On Screensaver
    	    Support.screensaverOn();
    		Support.screensaver();
    		
    		GuiPage_Search.selectedItem = 0;
    		GuiPage_Search.selectedItem2 = 0;
    		GuiPage_Search.updateSelectedItems();
    		
    		setTimeout(function () {
    			document.getElementById("GuiPage_Search").focus();
    		},500)
    		
    	}	
    });
    
    ime.setKeyFunc(tvKey.KEY_INFO, function (keyCode) {
    	GuiHelper.toggleHelp("GuiPage_Search");	
    });
    
    ime.setKeyFunc(tvKey.KEY_RETURN, function (keyCode) {
    	widgetAPI.blockNavigation(event);
    	document.getElementById("NoKeyInput").focus();
		Support.processReturnURLHistory();
    }); 
    
    ime.setKeyFunc(tvKey.KEY_EXIT, function (keyCode) {
    	document.getElementById("NoKeyInput").focus();
    	widgetAPI.sendExitEvent();
    });   
}
};


GuiPage_Search.keyDown = function() {
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

	switch(keyCode) {	
		case tvKey.KEY_LEFT:
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			this.processRightKey();
			break;	
		case tvKey.KEY_UP:
			this.processUpKey();
		break;
		case tvKey.KEY_DOWN:
			this.processDownKey();
			break;
		case tvKey.KEY_PANEL_CH_UP: 
		case tvKey.KEY_CH_UP: 
			this.processChannelUpKey();
			break;			
		case tvKey.KEY_PANEL_CH_DOWN: 
		case tvKey.KEY_CH_DOWN: 
			this.processChannelDownKey();
			break;		
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem();
			break;	
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			this.handleTools(true);
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_Search");
			break;
		case tvKey.KEY_YELLOW:	
			//Favourites - May not be needed on this page
			break;				
		case tvKey.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiPage_Search");
			break;	
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiPage_Search.handleTools = function(hasData) {
	if (hasData) {
		Support.updateURLHistory("GuiPage_Search",this.startParams[0],this.startParams[1],null,null,0,0,null);
		
		for (var index = 0; index<this.playItems.length;index++) {
			document.getElementById(this.playItems[index]+this.ItemData.SearchHints[this.selectedItem].ItemId).className = "musicTableTd";
		}
		this.selectedItem2 = 0;
		GuiMainMenu.requested("GuiPage_Search","Play_"+this.ItemData.SearchHints[this.selectedItem].ItemId,"musicTableTd red");
	} else {
		Support.updateURLHistory("GuiPage_Search",null,null,null,null,null,null,null);
		GuiMainMenu.requested("GuiPage_Search","searchInput");
	}
}

GuiPage_Search.processUpKey = function() {
	this.selectedItem--;
	if (this.selectedItem < 0) {
		//Reset and focus on IME
		this.selectedItem2 = 0;
		this.updateSelectedItems();
		
		//Must turn off as cannot catch keys during IME!
		Support.screensaverOff();
		
		document.getElementById("searchInput").focus();
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
	
}

GuiPage_Search.processDownKey = function() {
	this.selectedItem++;
	if (this.selectedItem >= this.ItemData.SearchHints.length) {
		this.selectedItem--;
		if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem++;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

GuiPage_Search.processLeftKey = function() {
	this.selectedItem2--;
	if (this.selectedItem2 < 0) {
		this.selectedItem2++;
	} else {
		this.updateSelectedItems();
	}
}

GuiPage_Search.processRightKey = function() {
	this.selectedItem2++;
	if (this.selectedItem2 > this.playItems.length-1) {
		this.selectedItem2--;
	} else {
		this.updateSelectedItems();
	}
}

GuiPage_Search.processChannelUpKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem - this.getMaxDisplay();
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
			this.topLeftItem = 0;
			this.updateDisplayedItems();
		} else {
			if (this.topLeftItem - this.getMaxDisplay() < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiPage_Search.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.SearchHints.length) {		
			this.selectedItem = (this.ItemData.SearchHints.length-1);
			if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			}
			this.updateDisplayedItems();
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}